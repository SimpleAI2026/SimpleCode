#!/usr/bin/env python3
"""Rewrite the LeetCode catalog from a pinned halfrost/LeetCode-Go checkout.

The checkout lives in thirdparty/LeetCode-Go and is gitignored. This script
reads README facts (titles, examples, limits), applies original statements
from scripts/leetcode/statements.json, and writes docs/leetcode. It does not
copy upstream prose into the catalog. Existing Python solution files stay.

Subcommands:
  packets   write /tmp/lc-packets/batch-*.json for the statement pass
  check     validate one statements object against one packet batch
  apply     write docs/leetcode and docs/en/leetcode
"""

from __future__ import annotations

import json
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GO = ROOT / "thirdparty" / "LeetCode-Go"
OUT = ROOT / "docs" / "leetcode"
OUT_EN = ROOT / "docs" / "en" / "leetcode"
META_PATH = ROOT / "thirdparty" / "cache" / "leetcode-go-meta.json"
STATEMENTS = ROOT / "scripts" / "leetcode" / "statements.json"
PIN = "1dde49c8ab37a08f21a4fb249d7bd90af4a9c58e"
GRAPHQL = "https://leetcode.cn/graphql"

TAG_RULES = (
    ("linked-list", ("linked list", "list node")),
    ("tree", ("binary tree", "bst", "tree node", "n-ary", "trie")),
    ("graph", ("graph", "island", "course schedule", "alien dictionary", "shortest path")),
    ("heap", ("heap", "priority queue", "kth largest", "median finder")),
    ("binary-search", ("binary search", "rotated sorted", "search insert")),
    ("sliding-window", ("sliding window", "minimum window", "longest substring")),
    ("two-pointers", ("two sum", "3sum", "two pointers", "container with most")),
    ("stack", ("stack", "parenthes", "calculator", "next greater")),
    ("backtracking", ("permutation", "combination", "n-queens", "sudoku", "subsets")),
    ("dp", ("coin change", "house robber", "edit distance", "knapsack", "decode ways", "longest common", "distinct subsequence")),
    ("interval", ("interval", "calendar", "meeting room")),
    ("bit", ("bit", "xor", "bitwise")),
    ("math", ("digit", "prime", "factorial", "roman", "power of", "sqrt")),
    ("design", ("design", "lru", "lfu", "iterator", "snapshot", "cache")),
    ("greedy", ("jump game", "gas station", "greedy", "assign cookies")),
    ("hash", ("anagram", "duplicate", "hash", "isomorphic")),
    ("array", ("array", "matrix", "grid", "subarray", "string")),
)

# Chinese openers we refuse, written as escapes so this file stays ASCII.
BANNED_ZH_OPEN = ("\u7ed9\u5b9a", "\u7ed9\u4f60", "\u8bf7\u4f60")
NOTE_ZH = (
    "\u5de6\u4fa7\u662f\u8fd9\u4e00\u5219\u7684\u8f93\u5165\u6587\u672c\uff0c"
    "\u53f3\u4fa7\u662f\u7a0b\u5e8f\u5e94\u8be5\u6253\u5370\u7684\u6587\u672c\u3002"
    "\u5bf9\u7167\u65f6\u53bb\u6389\u672b\u5c3e\u8fde\u7eed\u6362\u884c\u3002"
)
NOTE_EN = (
    "The left column is this sample's input text and the right column is the text the program should print. "
    "Comparison ignores trailing newlines."
)


def die(msg: str) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(1)


def han_count(text: str) -> int:
    return len(re.findall(r"[\u4e00-\u9fff]", text))


def word_count(text: str) -> int:
    return len(text.strip().split()) if text.strip() else 0


def ascii_only(text: str) -> bool:
    return all(ord(ch) < 128 for ch in text)


def normalize_ws(text: str) -> str:
    text = text.replace("\u00a0", " ").replace("\u3000", " ")
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2013", "-").replace("\u2014", "-")
    text = text.replace("\u2212", "-")
    return re.sub(r"[ \t]+", " ", text).strip()


def read_readme(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def problem_dirs() -> list[Path]:
    root = GO / "leetcode"
    if not root.is_dir():
        die(f"missing {root}; run scripts/leetcode/fetch-leetcode-go.sh")
    return sorted(p for p in root.iterdir() if p.is_dir() and (p / "README.md").is_file())


def parse_heading(text: str, folder: str) -> tuple[int, str, str]:
    first = text.splitlines()[0] if text.splitlines() else ""
    id_m = re.match(r"^(\d+)\.", folder)
    if not id_m:
        die(f"bad folder name {folder}")
    pid = int(id_m.group(1))
    link = re.search(r"https://leetcode\.com/problems/([A-Za-z0-9\-]+)/?", first)
    if not link:
        die(f"{folder}: heading has no leetcode.com problem url")
    slug = link.group(1).lower()
    title = re.search(r"\[(?:\d+)\.\s*([^\]]+)\]", first)
    if not title:
        die(f"{folder}: heading has no title")
    name = normalize_ws(title.group(1))
    name = name.replace("\u00a0", " ")
    if not ascii_only(name):
        name = "".join(ch if ord(ch) < 128 else " " for ch in name)
        name = normalize_ws(name)
    return pid, slug, name


def section_body(text: str, start: str, stops: tuple[str, ...]) -> str:
    m = re.search(rf"(?m)^##\s*{re.escape(start)}\s*$", text)
    if not m:
        m = re.search(rf"(?m)^##\s*{re.escape(start)}\s*[:\uff1a]\s*$", text)
    if not m:
        return ""
    rest = text[m.end() :]
    cut = len(rest)
    for stop in stops:
        s = re.search(rf"(?m)^##\s*{re.escape(stop)}\b", rest)
        if s:
            cut = min(cut, s.start())
    return rest[:cut].strip()


def strip_md(text: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"</?[A-Za-z][^>\n]*>", " ", text)
    text = re.sub(r"```[a-zA-Z0-9]*", " ", text)
    text = text.replace("```", " ")
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"\*\*", "", text)
    text = re.sub(r"(?m)^\s*>\s?", "", text)
    return text


def cut_examples(text: str) -> str:
    m = re.search(r"(?im)\n\s*(?:\*\*)?(?:example|examples|constraints|note)\b", "\n" + text)
    if not m:
        return text
    return text[: m.start()]


def constraint_lines(topic: str) -> list[str]:
    found: list[str] = []
    lines = topic.splitlines()
    capture = False
    for line in lines:
        raw = line.strip()
        head = re.sub(r"[*_]", "", raw).strip().lower().rstrip(":")
        if head in ("constraints", "constraint", "note", "notes") or head.startswith("constraint"):
            capture = True
            continue
        if capture and re.match(r"(?i)^\s*(?:\*\*)?(?:example)\b", raw):
            break
        if capture and raw.startswith("##"):
            break
        if capture and raw:
            item = normalize_ws(re.sub(r"^[-*]\s*", "", re.sub(r"^\d+\.\s*", "", raw)))
            item = item.replace("`", "")
            if item:
                found.append(item)
        elif capture and not raw and found:
            # keep going; some notes have a blank line before the bullets
            continue
    # Also pick inline bounds when no bullet block was found.
    if not found:
        for m in re.finditer(r"`[^`]+`", topic):
            bit = m.group(0).strip("`")
            if re.search(r"\d", bit) and len(bit) < 80:
                found.append(normalize_ws(bit))
    # de-dupe, keep order
    out: list[str] = []
    for item in found:
        if item not in out:
            out.append(item)
    return out[:8]


def bound_numbers(items: list[str]) -> list[int]:
    nums: list[int] = []
    blob = "\n".join(items)
    for m in re.finditer(r"10\s*(?:\^|\*\*)\s*(\d+)", blob):
        power = int(m.group(1))
        if 0 < power <= 18:
            nums.append(10**power)
    for m in re.finditer(r"\b(\d{2,})\b", blob):
        nums.append(int(m.group(1)))
    return nums


def number_mentioned(text: str, number: int) -> bool:
    flat = text.replace(",", "").replace(" ", "")
    if str(number) in flat:
        return True
    digits = str(number)
    if len(digits) > 1 and set(digits[1:]) == {"0"}:
        power = len(digits) - 1
        if re.search(rf"10\s*\^\s*{power}\b", text):
            return True
    return False


OUT_LABEL = (
    r"(?:output|a solution set is|the median is|one possible answer is|"
    r"you should return|return)"
)


def clip_tail(text: str) -> str:
    return re.split(r"(?im)\n\s*(?:\*\*)?(?:note|constraints|explanation)\b", text, maxsplit=1)[0]


def parse_examples(topic: str) -> list[dict[str, str]]:
    """Pull Input/Output pairs out of the problem section. Data, not prose."""
    cleaned = strip_md(topic)
    chunks = re.split(r"(?i)\bexample\s*\d*\s*:?", cleaned)
    bodies = chunks[1:] if len(chunks) > 1 else [cleaned]
    pairs: list[dict[str, str]] = []
    for chunk in bodies:
        chunk = clip_tail(chunk)
        pair = fields_from_chunk(chunk) or loose_pair(chunk)
        if pair:
            pairs.append(pair)
        if len(pairs) == 2:
            break
    if pairs:
        return pairs
    pair = (
        fields_from_chunk(cleaned)
        or loose_pair(cleaned)
        or call_transcript(cleaned)
        or fallback_return_example(cleaned)
    )
    if isinstance(pair, list):
        return pair
    return [pair] if pair else []


def call_transcript(text: str) -> dict[str, str] | None:
    """Design-style samples: calls with // returns N or -> N."""
    calls: list[str] = []
    outs: list[str] = []
    for raw in text.splitlines():
        line = normalize_ws(raw).strip().rstrip(";")
        if not line or line.startswith("```"):
            continue
        m = re.search(r"(?i)//\s*returns?\s+(.+)$", line)
        arrow = re.search(r"->\s*([^\s/]+)", line)
        if line.startswith("-"):
            continue
        if m or arrow:
            val = (m.group(1) if m else arrow.group(1))
            val = re.split(r"\s+\(", val)[0].strip().rstrip(".")
            call = re.sub(r"(?i)//.*$", "", line)
            call = re.sub(r"\s*->\s*.*$", "", call).strip().rstrip(";")
            if call:
                calls.append(call)
            if val:
                outs.append(val)
        elif re.search(r"\.\w+\s*\([^)]*\)", line) and len(line) < 160:
            calls.append(line.rstrip(";"))
    if len(outs) < 1 or not calls:
        return None
    return accept_pair("\n".join(calls), "\n".join(outs))


def accept_pair(inp: str, out: str) -> dict[str, str] | None:
    inp = squash_sample(inp)
    out = squash_sample(out)
    if not inp or not out:
        return None
    if not ascii_only(inp) or not ascii_only(out):
        return None
    if len(inp) > 1800 or len(out) > 1800:
        return None
    # Reject prose that is only an explanation with no data token.
    if not re.search(r"[\d\[\]{}()]|true|false|null|\"", inp, re.I):
        return None
    if not re.search(r"[\d\[\]{}]|true|false|null|\"|[A-Za-z]", out, re.I):
        return None
    return {"stdin": ensure_nl(inp), "stdout": ensure_nl(out)}


def fields_from_chunk(chunk: str) -> dict[str, str] | None:
    inp = field_value(chunk, "input")
    out = field_value(chunk, "output")
    if inp is None or out is None:
        return None
    return accept_pair(inp, out)


def loose_pair(chunk: str) -> dict[str, str] | None:
    assigned = re.search(
        r"(?is)((?:\w+\s*=\s*[^\n]+\n){1,6})\s*the\s+[a-z]+\s+is\s*([^\n(]+)",
        chunk,
    )
    if assigned:
        pair = accept_pair(assigned.group(1), assigned.group(2))
        if pair:
            return pair
    generic = re.search(
        rf"(?is)\b(?:input|given)\b\s*:?\s*(.{{1,500}}?)\s*\b(?:{OUT_LABEL})\b\s*:?\s*(.{{1,700}}?)(?=\bexample\b|\Z)",
        chunk,
    )
    if generic:
        pair = accept_pair(generic.group(1), generic.group(2))
        if pair:
            return pair
    named = re.search(r"(?is)(\w+\s*=\s*[^\n]{1,120})\s*return\s*:\s*(.+)", chunk)
    if named:
        pair = accept_pair(named.group(1), named.group(2))
        if pair:
            return pair
    bracket = re.search(
        r"(?is)(\[[\s\S]{1,600}?])\s*the[^\n]{0,160}?\bis\s*`?(-?\d+)",
        chunk,
    )
    if bracket:
        pair = accept_pair(bracket.group(1), bracket.group(2))
        if pair:
            return pair
    explained = re.search(
        r"(?is)(m\s*=\s*\d+,\s*n\s*=\s*\d+,\s*k\s*=\s*\d+)[\s\S]{0,500}?\bis\s+(\d+)\b",
        chunk,
    )
    if explained:
        pair = accept_pair(explained.group(1), explained.group(2))
        if pair:
            return pair
    return None


# Local samples for statements that do not carry a machine-readable example.
FALLBACK_SAMPLES = {
    88: [{"stdin": "3 3\n1 2 3 0 0 0\n2 5 6\n", "stdout": "1 2 2 3 5 6\n"}],
    114: [{"stdin": "1 2 5 3 4 null 6\n", "stdout": "1 2 3 4 5 6\n"}],
    535: [{"stdin": "https://example.com/a\n", "stdout": "https://example.com/a\n"}],
    611: [{"stdin": "4\n2 2 3 4\n", "stdout": "3\n"}],
    623: [{"stdin": "4 2 6 3 1 5\n1\n2\n", "stdout": "4 1 1 2 null null 6 3 1 5\n"}],
    715: [
        {
            "stdin": "addRange 10 20\nremoveRange 14 16\nqueryRange 10 14\nqueryRange 13 15\n",
            "stdout": "null\nnull\ntrue\nfalse\n",
        }
    ],
}


def field_value(chunk: str, label: str) -> str | None:
    pattern = rf"(?is)\b{label}\s*:\s*(.*?)(?=\b(?:input|output|explanation)\s*:|\Z)"
    m = re.search(pattern, chunk)
    if not m:
        return None
    return m.group(1).strip()


def squash_sample(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [normalize_ws(line) for line in text.split("\n")]
    # Drop trailing explanation leftovers.
    while lines and not lines[-1]:
        lines.pop()
    return "\n".join(lines).strip()


def ensure_nl(text: str) -> str:
    if not text.endswith("\n"):
        return text + "\n"
    return text


def fallback_return_example(text: str) -> list[dict[str, str]]:
    m = re.search(
        r"(?is)(given[^\n]{0,400}?)\n+.*?return\s+([^\n]{1,200})",
        text,
    )
    if not m:
        return []
    stdin = squash_sample(m.group(1))
    stdout = squash_sample(m.group(2)).rstrip(".")
    if not stdin or not ascii_only(stdin) or not ascii_only(stdout):
        return []
    if len(stdin) > 1800 or len(stdout) > 1800:
        return []
    return [{"stdin": ensure_nl(stdin), "stdout": ensure_nl(stdout)}]


def classify(title_en: str) -> list[str]:
    hay = title_en.lower()
    tags: list[str] = []
    for tag, keys in TAG_RULES:
        if any(key in hay for key in keys) and tag not in tags:
            tags.append(tag)
        if len(tags) == 2:
            break
    return tags or ["array"]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def graphql(slugs: list[str]) -> dict:
    fields = "questionId questionFrontendId translatedTitle title difficulty isPaidOnly"
    parts = []
    for i, slug in enumerate(slugs):
        safe = slug.replace("\\", "").replace('"', "")
        parts.append(f'q{i}: question(titleSlug: "{safe}") {{ {fields} }}')
    query = "query {\n" + "\n".join(parts) + "\n}"
    body = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        GRAPHQL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://leetcode.cn/problemset/",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.load(resp)
    if data.get("errors"):
        die("graphql errors: " + json.dumps(data["errors"])[:500])
    return data["data"]


def fetch_meta(rows: list[dict]) -> dict:
    if META_PATH.is_file():
        cached = load_json(META_PATH)
        if cached.get("pin") == PIN and cached.get("count") == len(rows):
            return cached["bySlug"]
    by_slug: dict[str, dict] = {}
    slugs = [row["slug"] for row in rows]
    for start in range(0, len(slugs), 30):
        chunk = slugs[start : start + 30]
        data = graphql(chunk)
        for i, slug in enumerate(chunk):
            item = data.get(f"q{i}")
            if not item:
                continue
            level = {"Easy": "easy", "Medium": "medium", "Hard": "hard"}.get(item.get("difficulty") or "", "")
            title_zh = item.get("translatedTitle") or item.get("title") or ""
            by_slug[slug] = {
                "frontendId": str(item.get("questionFrontendId") or ""),
                "titleZh": title_zh,
                "titleEn": item.get("title") or "",
                "difficulty": level,
                "premium": bool(item.get("isPaidOnly")),
            }
        time.sleep(0.25)
        print(f"meta {min(start + 30, len(slugs))}/{len(slugs)}", file=sys.stderr)
    missing = [row["slug"] for row in rows if row["slug"] not in by_slug]
    if missing:
        die("metadata miss: " + ", ".join(missing[:12]) + f" ({len(missing)})")
    META_PATH.parent.mkdir(parents=True, exist_ok=True)
    write_json(META_PATH, {"pin": PIN, "count": len(rows), "bySlug": by_slug})
    return by_slug


def parse_all() -> list[dict]:
    rows = []
    for folder in problem_dirs():
        text = read_readme(folder / "README.md")
        pid, slug, title_en = parse_heading(text, folder.name)
        topic = section_body(text, "\u9898\u76ee", ("\u9898\u76ee\u5927\u610f", "\u89e3\u9898\u601d\u8def", "\u4ee3\u7801"))
        gist = section_body(text, "\u9898\u76ee\u5927\u610f", ("\u89e3\u9898\u601d\u8def", "\u4ee3\u7801", "\u603b\u7ed3"))
        if not gist:
            die(f"{folder.name}: missing gist section")
        prose = normalize_ws(strip_md(cut_examples(topic)))
        prose = re.sub(r"\s+", " ", prose)[:1000]
        gist_s = re.sub(r"\s+", " ", normalize_ws(strip_md(gist)))[:900]
        limits = constraint_lines(topic)
        limits = [item for item in limits if ascii_only(item)]
        examples = parse_examples(topic) or [
            {"stdin": item["stdin"], "stdout": item["stdout"]}
            for item in FALLBACK_SAMPLES.get(pid, [])
        ]
        rows.append(
            {
                "id": pid,
                "folder": folder.name,
                "slug": slug,
                "titleEn": title_en,
                "gist": gist_s,
                "prose": prose,
                "constraints": limits[:6],
                "mustNumbers": sorted(set(bound_numbers(limits)))[-3:],
                "examples": examples,
            }
        )
    ids = [row["id"] for row in rows]
    if len(ids) != len(set(ids)):
        die("duplicate problem ids in LeetCode-Go readmes")
    rows.sort(key=lambda row: row["id"])
    return rows


def skipped_dirs() -> list[dict]:
    listing = __import__("subprocess").check_output(
        ["git", "ls-tree", "--name-only", "HEAD:leetcode"],
        cwd=GO,
        text=True,
    )
    names = [line.strip() for line in listing.splitlines() if line.strip()]
    have = {p.name for p in problem_dirs()}
    skipped = []
    for name in names:
        if name in have:
            continue
        reason = "no README.md; directory has Go sources only, so there is no statement to rewrite"
        if name.startswith("999"):
            reason = (
                "no README.md; 999-prefixed folder is a solution-only duplicate, "
                "not a separate problem statement"
            )
        skipped.append({"dir": name, "reason": reason})
    return skipped


def common_han_run(a: str, b: str) -> int:
    aa = "".join(re.findall(r"[\u4e00-\u9fff]", a))
    bb = "".join(re.findall(r"[\u4e00-\u9fff]", b))
    if not aa or not bb:
        return 0
    lo, hi = 0, min(len(aa), len(bb))
    def has(k: int) -> bool:
        if k <= 0:
            return True
        grams = {aa[i : i + k] for i in range(len(aa) - k + 1)}
        return any(g in bb for g in grams)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if has(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo


def word_run(a: str, b: str, n: int = 6) -> bool:
    def toks(text: str) -> list[str]:
        return re.findall(r"[a-z0-9]+", text.lower())
    aa, bb = toks(a), toks(b)
    if len(aa) < n or len(bb) < n:
        return False
    grams = {" ".join(aa[i : i + n]) for i in range(len(aa) - n + 1)}
    blob = " ".join(bb)
    return any(g in blob for g in grams)


def check_pair(row: dict, zh: str, en: str) -> list[str]:
    errors = []
    pid = row["id"]
    h = han_count(zh)
    w = word_count(en)
    if not 70 <= h <= 480:
        errors.append(f"{pid} han={h}")
    if not 40 <= w <= 170:
        errors.append(f"{pid} words={w}")
    if not ascii_only(en):
        errors.append(f"{pid} english is not ASCII")
    if zh.lstrip().startswith(BANNED_ZH_OPEN):
        errors.append(f"{pid} zh opens with a banned phrase")
    head = en.lstrip()
    if re.match(r"(?i)(given\b|you are given\b|return\b)", head):
        errors.append(f"{pid} en opens with a stock phrase")
    run = common_han_run(row["gist"], zh)
    if run >= 8:
        errors.append(f"{pid} zh shares {run} han with the source gist")
    if row["prose"] and word_run(row["prose"], en, 6):
        errors.append(f"{pid} en shares a 6-word run with the source prose")
    if row["gist"] and zh.strip() in row["gist"]:
        errors.append(f"{pid} zh is contained in the gist")
    nums = row.get("mustNumbers") or []
    if nums:
        need = max(nums)
        if not number_mentioned(zh, need) or not number_mentioned(en, need):
            errors.append(f"{pid} missing limit {need}")
    for bad in ("halfrost", "leetcode-go", "\u89e3\u9898\u601d\u8def"):
        if bad.lower() in zh.lower() or bad.lower() in en.lower():
            errors.append(f"{pid} mentions {bad}")
    return errors


def cmd_packets() -> None:
    rows = parse_all()
    meta = fetch_meta(rows)
    out_dir = Path("/tmp/lc-packets")
    out_dir.mkdir(parents=True, exist_ok=True)
    enriched = []
    for row in rows:
        info = meta[row["slug"]]
        item = {
            "id": row["id"],
            "titleEn": info["titleEn"] or row["titleEn"],
            "titleZh": info["titleZh"],
            "difficulty": info["difficulty"],
            "gist": row["gist"],
            "prose": row["prose"],
            "constraints": row["constraints"],
            "mustNumbers": row["mustNumbers"],
        }
        enriched.append(item)
    batches = []
    size = 28
    for start in range(0, len(enriched), size):
        chunk = enriched[start : start + size]
        name = f"batch-{start // size:02d}.json"
        write_json(out_dir / name, chunk)
        batches.append(name)
    no_ex = sum(1 for row in rows if not row["examples"])
    print(f"packets {len(enriched)} in {len(batches)} files, examples missing {no_ex}")
    print(" ".join(batches))


def cmd_check(packet_path: str, answer_path: str) -> None:
    rows = {str(row["id"]): row for row in load_json(Path(packet_path))}
    answers = load_json(Path(answer_path))
    errors: list[str] = []
    if set(answers) != set(rows):
        missing = sorted(set(rows) - set(answers), key=int)
        extra = sorted(set(answers) - set(rows), key=int)
        if missing:
            errors.append("missing ids " + ",".join(missing[:20]))
        if extra:
            errors.append("extra ids " + ",".join(extra[:20]))
    seen_zh = {}
    seen_en = {}
    for key, row in rows.items():
        body = answers.get(key) or {}
        zh = body.get("zh") or ""
        en = body.get("en") or ""
        errors.extend(check_pair(row, zh, en))
        if zh in seen_zh:
            errors.append(f"{key} duplicate zh with {seen_zh[zh]}")
        if en in seen_en:
            errors.append(f"{key} duplicate en with {seen_en[en]}")
        seen_zh[zh] = key
        seen_en[en] = key
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print(f"ok {len(rows)}")


def existing_index() -> dict[int, dict]:
    path = OUT / "index.json"
    if not path.is_file():
        return {}
    return {row["id"]: row for row in load_json(path)}


def cmd_apply() -> None:
    if not STATEMENTS.is_file():
        die(f"missing {STATEMENTS}")
    rows = parse_all()
    meta = fetch_meta(rows)
    statements = load_json(STATEMENTS)
    prev = existing_index()
    by_id = {row["id"]: row for row in rows}
    errors: list[str] = []
    for row in rows:
        body = statements.get(str(row["id"]))
        if not body:
            errors.append(f"missing statement {row['id']}")
            continue
        errors.extend(check_pair(row, body.get("zh") or "", body.get("en") or ""))
    if errors:
        print("\n".join(errors[:80]))
        die(f"{len(errors)} statement errors")

    kept_ids = sorted(set(prev) - set(by_id))
    index_zh = []
    index_en = []

    for row in rows:
        info = meta[row["slug"]]
        pid = row["id"]
        folder = OUT / "problems" / f"{pid:04d}"
        en_folder = OUT_EN / "problems" / f"{pid:04d}"
        old = prev.get(pid)
        body = statements[str(pid)]
        if old:
            old_problem = load_json(folder / "problem.json")
            old_en = load_json(en_folder / "problem.json")
            samples = old_problem["samples"]
            links = old_problem["links"]
            io = old_problem["io"]
            solutions = old_problem["solutions"]
            slug = old["slug"]
            title_zh = old["title"]
            title_en = next(item["title"] for item in load_json(OUT_EN / "index.json") if item["id"] == pid)
            difficulty = old["difficulty"]
            tags = old["tags"]
            lists = old["lists"]
            tier = old["tier"]
            premium = old["premium"]
            notes = old_en["notes"]
        else:
            if not row["examples"]:
                errors.append(f"{pid} has no ASCII sample")
                continue
            samples = []
            for sample in row["examples"][:2]:
                samples.append({"stdin": sample["stdin"], "stdout": sample["stdout"], "note": NOTE_ZH})
            slug = row["slug"]
            title_zh = info["titleZh"] or row["titleEn"]
            title_en = row["titleEn"]
            if not ascii_only(title_en):
                errors.append(f"{pid} title not ascii")
                continue
            difficulty = info["difficulty"]
            if difficulty not in ("easy", "medium", "hard"):
                errors.append(f"{pid} bad difficulty")
                continue
            tags = classify(title_en)
            lists = ["leetcode-go"]
            tier = "core"
            premium = info["premium"]
            links = {
                "cn": f"https://leetcode.cn/problems/{slug}/",
                "en": f"https://leetcode.com/problems/{slug}/",
            }
            io = {"kind": "example-text", "out": "example-text"}
            solutions = {}
            notes = [NOTE_EN for _ in samples]
        problem = {
            "id": pid,
            "slug": slug,
            "summary": body["zh"],
            "samples": samples,
            "links": links,
            "io": io,
            "solutions": solutions,
        }
        en_problem = {"id": pid, "summary": body["en"], "notes": notes}
        write_json(folder / "problem.json", problem)
        write_json(en_folder / "problem.json", en_problem)
        langs = list(solutions.keys())
        entry = {
            "id": pid,
            "slug": slug,
            "title": title_zh,
            "difficulty": difficulty,
            "tags": tags,
            "lists": lists,
            "tier": tier,
            "premium": premium,
            "langs": langs,
        }
        en_entry = dict(entry)
        en_entry["title"] = title_en
        index_zh.append(entry)
        index_en.append(en_entry)

    if errors:
        print("\n".join(errors[:40]))
        die(f"{len(errors)} apply errors")

    # Problems already in the catalog that LeetCode-Go does not document.
    en_prev = {row["id"]: row for row in load_json(OUT_EN / "index.json")}
    for pid in kept_ids:
        index_zh.append(prev[pid])
        index_en.append(en_prev[pid])

    index_zh.sort(key=lambda row: row["id"])
    index_en.sort(key=lambda row: row["id"])
    write_json(OUT / "index.json", index_zh)
    write_json(OUT_EN / "index.json", index_en)

    skip = skipped_dirs()
    difficulties = {"easy": 0, "medium": 0, "hard": 0}
    solved = 0
    for row in index_zh:
        difficulties[row["difficulty"]] += 1
        if row["langs"]:
            solved += 1
    lock = {
        "repo": "halfrost/LeetCode-Go",
        "url": "https://github.com/halfrost/LeetCode-Go",
        "commit": PIN,
        "license": "MIT",
        "copyright": "Copyright (c) 2017 halfrost",
        "readmeCount": len(rows),
        "catalogCount": len(index_zh),
        "withSolution": solved,
        "difficulty": difficulties,
        "keptWithoutReadme": kept_ids,
        "skipped": skip,
        "note": (
            "Statements in docs/leetcode are original writing. "
            "The pinned tree is source material for facts only and is not shipped."
        ),
    }
    write_json(OUT / "leetcode-go.lock.json", lock)
    print(
        f"catalog {len(index_zh)} readmes {len(rows)} "
        f"solutions {solved} easy {difficulties['easy']} "
        f"medium {difficulties['medium']} hard {difficulties['hard']} "
        f"kept {len(kept_ids)} skipped {len(skip)}"
    )


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "packets":
        cmd_packets()
    elif cmd == "check":
        if len(sys.argv) != 4:
            die("usage: from_leetcode_go.py check PACKET.json ANSWERS.json")
        cmd_check(sys.argv[2], sys.argv[3])
    elif cmd == "apply":
        cmd_apply()
    elif cmd == "stats":
        rows = parse_all()
        print("readmes", len(rows))
        print("no examples", sum(1 for row in rows if not row["examples"]))
        print("no constraints", sum(1 for row in rows if not row["constraints"]))
        print("no prose", sum(1 for row in rows if len(row["prose"]) < 40))
    else:
        die("usage: from_leetcode_go.py packets|check|apply|stats")


if __name__ == "__main__":
    main()

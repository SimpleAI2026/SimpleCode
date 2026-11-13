# LeetCode 题库数据

这里不是一本快速入门。`scripts/docs/render.ts` 跳过 `leetcode/`，`BOOKS` 也不含它。十五本快速入门的篇幅、ASCII 和 `docs-smoke` 不读这些 JSON。

中文题名、题面、样例和题解在本目录。英文题名、题面和样例说明在 `docs/en/leetcode/`，文件名与题号相同。题解只有一份，不复制到英文目录。

这一批是 820 道题：简单 270、中等 444、困难 106。其中 788 道来自 halfrost/LeetCode-Go 在 `1dde49c8ab37a08f21a4fb249d7bd90af4a9c58e` 的 `leetcode/*/README.md`。题面是按题号、题名、难度、样例和限制重写的，不收录上游句子。另外 32 道是原先已有 Python 题解、但那次检出没有 README 的题，短摘要和样例保持原样。200 道有 Python 题解。没有题解的题目 `solutions` 为空，界面显示「这门语言还没有题解」，样例仍可运行。

样例输入输出只用 ASCII。中文题面 40–480 个汉字，英文 30–170 个词。

题解从 `SOURCES.md` 列出的四个仓库拷贝。每个 `problems/NNNN/*.py` 文件头写仓库、commit、许可证和修改。MIT 全文在 `LICENSES/MIT.txt`。CC BY-SA 4.0 全文在 `LICENSES/CC-BY-SA-4.0.txt`。包装模板在 `harness/`，本身是 MIT，不含上游题解正文。

LeetCode-Go 的许可证是 MIT，Copyright (c) 2017 halfrost。检出放在 `thirdparty/LeetCode-Go/`（gitignore），页面运行时不读它。重新生成：`scripts/leetcode/fetch-leetcode-go.sh`，再 `python3 scripts/leetcode/from_leetcode_go.py apply`。自写题面在 `scripts/leetcode/statements.json`。`leetcode-go.lock.json` 记下 commit、题数和跳过的目录。

不要再跑 `scripts/leetcode/import.mjs` 来覆盖这一批题面。那个脚本只服务早先的 200 道题解导入。

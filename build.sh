#!/usr/bin/env bash
# SimpleCode build helper
set -euo pipefail
cd "$(dirname "$0")"

HOST="${HOST:-localhost}"
PORT="${PORT:-}"

c_bold=$'\033[1m'; c_dim=$'\033[2m'; c_green=$'\033[32m'; c_red=$'\033[31m'; c_off=$'\033[0m'
info() { echo "${c_bold}▸ $*${c_off}"; }
die() { echo "${c_red}✗ $*${c_off}" >&2; exit 1; }

need_deps() { [ -d node_modules ] || cmd_install; }
# Fingerprint whatever binaries are on disk. Missing files (exit 2) trigger a
# full vendor; a bad file fails instead of being rebuilt over a warning.
# vendor itself falls back to vendor/prebuilt when the build cannot finish.
need_wasm() {
  if node scripts/write-manifest.mjs; then
    return 0
  fi
  local status=$?
  if [ "$status" -eq 2 ]; then
    cmd_vendor
    return 0
  fi
  exit "$status"
}
need_java() {
  local f
  for f in compiler.wasm compiler.wasm-runtime.js compile-classlib-teavm.bin runtime-classlib-teavm.bin; do
    if [ ! -f "wasm/java/$f" ]; then
      cmd_vendor --java
      return 0
    fi
  done
}
sync_dist_wasm() {
  [ -d dist ] || return 0
  rm -rf dist/wasm
  cp -RL wasm dist/wasm
}

cmd_install() {
  command -v yarn >/dev/null || die "yarn not found (try: corepack enable)"
  info "Installing dependencies (yarn)"
  yarn install
}

cmd_vendor() {
  if [ "${1:-}" = "--pack" ]; then
    info "Packing wasm/ into vendor/prebuilt/ (deterministic tar.gz, split above 90 MB)"
    node scripts/vendor-prebuilt.mjs pack
    return
  fi
  if [ "${1:-}" = "--rust" ]; then
    shift
    info "Vendoring the weblings Rust toolchain → wasm/rust/ (committed; not the default manifest)"
    node scripts/vendor-rust.mjs "$@"
    return
  fi
  if [ "${1:-}" = "--java" ]; then
    info "Vendoring the TeaVM Java toolchain → wasm/java/ (not the default manifest)"
    node scripts/vendor-prebuilt.mjs run --java
    return
  fi
  if [ "${1:-}" = "--pyodide" ]; then
    info "Vendoring Pyodide, NumPy, and the Fashion-MNIST subset → wasm/pyodide/"
    node scripts/vendor-prebuilt.mjs run --pyodide
    return
  fi
  info "Vendoring wasm binaries → wasm/"
  node scripts/vendor-prebuilt.mjs run "$@"
}

cmd_dev() {
  need_deps; need_wasm; need_java
  info "Starting dev server (COOP/COEP enabled)"
  exec yarn vite --host "$HOST" ${PORT:+--port "$PORT"} "$@"
}

cmd_build() {
  need_deps; need_wasm; need_java
  if [ ! -f wasm/java/compiler.wasm ]; then
    echo "${c_bold}⚠ wasm/java is missing — run ./build.sh vendor --java, then rebuild dist${c_off}" >&2
  fi
  if [ ! -f wasm/rust/rustc.wasm ] || [ ! -f wasm/rust/sysroot-wasip1.bundle ]; then
    echo "${c_bold}⚠ wasm/rust is missing — the toolchain is committed; restore wasm/rust and rebuild dist${c_off}" >&2
  fi
  info "Type-checking"
  yarn vue-tsc --noEmit
  info "Building → dist/"
  yarn vite build "$@"
  if [ -d dist/assets ]; then
    local js_chunks
    js_chunks=$(find dist/assets -name '*.js' | wc -l | tr -d ' ')
    echo "js chunks: ${js_chunks}"
  fi
  echo "${c_green}✓ build complete:${c_off} $(du -sh dist | cut -f1) in dist/"
}

cmd_preview() {
  need_deps
  [ -f dist/index.html ] || cmd_build
  need_wasm
  need_java
  info "Syncing wasm/ into dist/wasm"
  sync_dist_wasm
  info "Serving dist/ with COOP/COEP headers"
  exec yarn vite preview --host "$HOST" --port "${PORT:-4173}" --strictPort "$@"
}

cmd_test() {
  need_deps
  local docs_only=0 smoke_only=0
  local args=()
  for a in "$@"; do
    case "$a" in
      --docs) docs_only=1 ;;
      --smoke) smoke_only=1 ;;
      *) args+=("$a") ;;
    esac
  done
  info "Docs unit tests"
  node --experimental-strip-types --test tests/docs-unit.test.ts tests/docs-length.test.ts tests/docs-ascii.test.ts tests/readme-assets.test.ts tests/samples-locale.test.ts tests/manifest-refresh.test.mjs tests/i18n-unit.test.ts tests/terminal-log.test.ts tests/coi-unit.test.ts tests/pinned-fetch.test.ts tests/rust-toolchain.test.ts tests/rust-no-remote.test.ts tests/pyodide-no-remote.test.ts tests/minitorch.test.mjs tests/wasm-static.test.mjs tests/comment-font.test.ts tests/leetcode-unit.test.ts tests/vendor-prebuilt.test.mjs
  info "Monochrome check"
  node scripts/check-mono.mjs
  if [ "$docs_only" = 1 ]; then
    [ -f dist/index.html ] || cmd_build
    node --experimental-strip-types tests/docs-smoke.mjs "${args[@]}"
    return
  fi
  if [ "$smoke_only" = 1 ]; then
    [ -f dist/index.html ] || cmd_build
    node tests/smoke.mjs "${args[@]}"
    return
  fi
  info "Running headless smoke test (builds if needed)"
  [ -f dist/index.html ] || cmd_build
  node tests/smoke.mjs "${args[@]}"
  node tests/java-stale-cache.spec.mjs
  node tests/java-dev-download.spec.mjs
  node tests/rust-static-download.spec.mjs
  node tests/coi-static.mjs
  node --experimental-strip-types tests/docs-smoke.mjs
  node tests/leetcode-smoke.mjs
  node tests/learn.spec.mjs
  node tests/ui-chrome.spec.mjs
  node tests/numpy-ui.spec.mjs
  node tests/leetcode-scope.spec.mjs
  node tests/terminal-switch.spec.mjs
}

cmd_clean() {
  info "Removing dist/ and Vite cache"
  rm -rf dist node_modules/.vite
  if [ "${1:-}" = "--all" ]; then
    info "Removing node_modules/ and generated wasm/ binaries"
    rm -rf node_modules
    if [ -d wasm ]; then
      find wasm -mindepth 1 -maxdepth 1 ! -name rust -exec rm -rf {} +
      if [ -d wasm/rust ]; then
        find wasm/rust -mindepth 1 \
          ! -name rustc.wasm ! -name sysroot-wasip1.bundle ! -name SOURCES.md \
          -exec rm -rf {} +
      fi
    fi
  fi
}

cmd_help() {
  cat <<USAGE
${c_bold}SimpleCode build helper${c_off}

Usage: ./build.sh <command> [args]

  install            Install dependencies with yarn
  vendor [--link|--rust|--java|--pyodide|--pack]
                     Copy wasm runtimes from thirdparty/runno/langs into wasm/,
                     build Lua, Go, and Shell, download the Linux guest, and
                     write wasm/manifest.json (--link: symlink Runno files,
                     --source <dir>: alternative Runno directory).
                     If that fails, extract vendor/prebuilt/*.tar.gz, check sha256,
                     and rewrite the manifest from the extracted files.
                     --pack rewrites those archives from the current wasm/ tree.
                     --rust checks the pinned weblings toolchain in wasm/rust/ (committed).
                     --rust --refresh re-downloads those archives from GitHub and overwrites wasm/rust/.
                     Rust is not part of the prebuilt archives or the default manifest.
                     --java downloads the pinned TeaVM files into wasm/java/.
                     If the download fails, the java archive in vendor/prebuilt is extracted.
                     --pyodide downloads Pyodide 314, the NumPy wheel, and a Fashion-MNIST
                     subset into wasm/pyodide/. Those files are in the runtime manifest.
                     If the download fails, the runtime archive in vendor/prebuilt is extracted.
                     manifest.json is generated and not committed.
  dev                Start the Vite dev server (http://localhost:5173)
  build              Type-check and build production bundle into dist/ (incl. dist/wasm)
  preview | run      Serve dist/ with COOP/COEP headers (http://localhost:4173)
  test [--docs|--smoke]  Headless tests. Default: unit + mono + smoke + static COI + docs-smoke + leetcode-smoke + learn UI.
                     --docs runs the tutorial smoke test; --smoke runs the language hello-world smoke test.
                     LeetCode smoke runs shipped Python solutions. SIMPLECODE_JAVA_LEETCODE=1 also runs Java.
                     SIMPLECODE_RUST_LEETCODE=1 also runs Rust. SIMPLECODE_LEETCODE_LANGS limits the list (python,go).
  clean [--all]      Remove dist/ (and node_modules/ plus generated wasm/ with --all;
                     the committed wasm/rust toolchain stays)
  help               Show this help

Environment: HOST (default localhost), PORT
             SIMPLECODE_JAVA_LEETCODE, SIMPLECODE_RUST_LEETCODE, SIMPLECODE_LEETCODE_LANGS
USAGE
}

cmd="${1:-help}"; shift || true
case "$cmd" in
  install) cmd_install "$@" ;;
  vendor) cmd_vendor "$@" ;;
  dev) cmd_dev "$@" ;;
  build) cmd_build "$@" ;;
  preview|run|serve) cmd_preview "$@" ;;
  test|smoke) cmd_test "$@" ;;
  clean) cmd_clean "$@" ;;
  help|-h|--help) cmd_help ;;
  *) cmd_help; die "unknown command: $cmd" ;;
esac

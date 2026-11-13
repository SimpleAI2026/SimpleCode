// Language definitions. `{entry}` is replaced with the program path (/program) at run time.
// Runno assets are copied from thirdparty/runno/langs. `build` assets are produced by
// scripts/builders/<name>/build.sh (versions and sha256 in scripts/sources.lock.json).
export const assets = {
  "python-wasm": { file: "python-3.11.3.wasm" },
  "python-fs": { file: "python-3.11.3.tar.gz" },
  "ruby-wasm": { file: "ruby-3.2.0.wasm" },
  "ruby-fs": { file: "ruby-3.2.0.tar.gz" },
  "quickjs-wasm": { file: "wasmedge_quickjs.wasm" },
  "sqlite-wasm": { file: "sqlite.wasm" },
  "php-wasm": { file: "php-cgi-8.2.0.wasm" },
  "clang-wasm": { file: "clang.wasm" },
  "wasm-ld": { file: "wasm-ld.wasm" },
  "clang-fs": { file: "clang-fs.tar.gz" },
  "lua-wasm": { file: "lua-5.4.9.wasm", build: "lua" },
  "go-wasm": { file: "yaegi-0.16.1.wasm", build: "go" },
  "shell-wasm": { file: "wasi-sh.wasm", build: "shell" },
  // v86 0.5.471 plus a pinned Buildroot 6.8 bzImage. linux-state.zst is a zstd
  // frame of save_state() (not byte-stable, so it is not in sources.lock).
  // v86 restores that frame itself. The bzImage is stored raw.
  "v86-wasm": { file: "v86.wasm", build: "linux", kind: "wasm" },
  "v86-lib": { file: "libv86.mjs", build: "linux", kind: "bin" },
  "linux-bios": { file: "seabios.bin", build: "linux", kind: "bin" },
  "linux-vgabios": { file: "vgabios.bin", build: "linux", kind: "bin" },
  "linux-bzimage": { file: "linux-bzimage.bin", build: "linux", kind: "bin" },
  "linux-state": { file: "linux-state.zst", build: "linux", kind: "bin" },
  // Pyodide 314 + NumPy. Same-origin files under wasm/pyodide/. Not a WASI module.
  // `./build.sh vendor --pyodide` downloads the pin; the runtime prebuilt archive
  // is the fallback when that download cannot run.
  "pyodide-mjs": { file: "pyodide/pyodide.mjs", kind: "bin", download: "pyodide" },
  "pyodide-asm-mjs": { file: "pyodide/pyodide.asm.mjs", kind: "bin", download: "pyodide" },
  "pyodide-wasm": { file: "pyodide/pyodide.asm.wasm", kind: "bin", download: "pyodide" },
  "pyodide-stdlib": { file: "pyodide/python_stdlib.zip", kind: "bin", download: "pyodide" },
  "pyodide-lock": { file: "pyodide/pyodide-lock.json", kind: "bin", download: "pyodide" },
  "pyodide-numpy": { file: "pyodide/numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl", kind: "bin", download: "pyodide" },
  "pyodide-fashion": { file: "pyodide/fashion-mnist.bin", kind: "bin", download: "pyodide" },
  "pyodide-house": { file: "pyodide/house-tiny.csv", kind: "bin", download: "pyodide" },
  "pyodide-airfoil": { file: "pyodide/airfoil-tiny.csv", kind: "bin", download: "pyodide" },
};

const clangLink = (extra) => ({
  step: "link",
  asset: "wasm-ld",
  binaryName: "wasm-ld",
  args: [
    "--no-threads", "--export-dynamic", "-z", "stack-size=1048576",
    "-L/sys/lib/wasm32-wasi", "/sys/lib/wasm32-wasi/crt1.o", "/program.o",
    ...extra, "-o", "/program.wasm",
  ],
});

export const languages = [
  {
    id: "python", label: "Python", short: "Py", version: "3.11.3", syntax: "python", fileName: "main.py",
    run: { asset: "python-wasm", binaryName: "python", args: ["{entry}"], baseFS: "python-fs" },
  },
  {
    id: "ruby", label: "Ruby", short: "Rb", version: "3.2.0", syntax: "ruby", fileName: "main.rb",
    run: { asset: "ruby-wasm", binaryName: "ruby", args: ["-r", "/ruby-3.2.0/.rubyopts.rb", "{entry}"], baseFS: "ruby-fs" },
  },
  {
    id: "quickjs", label: "JS/TS", short: "JS", version: "QuickJS", syntax: "javascript", fileName: "main.js",
    run: { asset: "quickjs-wasm", binaryName: "quickjs", args: ["{entry}"] },
  },
  {
    id: "sqlite", label: "SQLite", short: "SQL", version: "3", syntax: "sql", fileName: "main.sql",
    run: { asset: "sqlite-wasm", binaryName: "sqlite", args: ["-batch", "-cmd", ".read {entry}"] }, autoEOF: true,
  },
  {
    id: "clang", label: "C", short: "C", version: "clang 8", syntax: "c", fileName: "main.c",
    prepare: [
      {
        step: "compile", asset: "clang-wasm", binaryName: "clang", baseFS: "clang-fs",
        args: [
          "-cc1", "-Werror", "-triple", "wasm32-unkown-wasi", "-isysroot", "/sys",
          "-internal-isystem", "/sys/include", "-internal-isystem", "/sys/lib/clang/8.0.1/include",
          "-ferror-limit", "4", "-fmessage-length", "80", "-fcolor-diagnostics", "-O2",
          "-emit-obj", "-o", "/program.o", "{entry}",
        ],
      },
      clangLink(["-lc"]),
    ],
    run: { fsPath: "/program.wasm", binaryName: "program", args: [] },
  },
  {
    id: "clangpp", label: "C++", short: "C++", version: "clang 8", syntax: "cpp", fileName: "main.cpp",
    prepare: [
      {
        step: "compile", asset: "clang-wasm", binaryName: "clang", baseFS: "clang-fs",
        args: [
          "-cc1", "-Werror", "-emit-obj", "-disable-free", "-isysroot", "/sys",
          "-internal-isystem", "/sys/include/c++/v1", "-internal-isystem", "/sys/include",
          "-internal-isystem", "/sys/lib/clang/8.0.1/include", "-ferror-limit", "4",
          "-fmessage-length", "80", "-fcolor-diagnostics", "-O2", "-o", "/program.o",
          "-x", "c++", "{entry}",
        ],
      },
      clangLink(["-lc", "-lc++", "-lc++abi"]),
    ],
    run: { fsPath: "/program.wasm", binaryName: "program", args: [] },
  },
  {
    id: "php-cgi", label: "PHP", short: "PHP", version: "8.2.0", syntax: "php", fileName: "main.php",
    run: { asset: "php-wasm", binaryName: "php", args: ["-q", "{entry}"] },
  },
  {
    id: "lua", label: "Lua", short: "Lua", version: "5.4.9", syntax: "lua", fileName: "main.lua",
    license: "MIT", homepage: "https://www.lua.org/",
    run: { asset: "lua-wasm", binaryName: "lua", args: ["{entry}"] },
  },
  {
    id: "go", label: "Go", short: "Go", version: "Yaegi 0.16.1", syntax: "go", fileName: "main.go",
    license: "Apache-2.0", homepage: "https://github.com/traefik/yaegi",
    run: { asset: "go-wasm", binaryName: "yaegi", args: ["{entry}"] },
  },
  {
    id: "shell", label: "Shell", short: "Sh", version: "wasi-sh", syntax: "shell", fileName: "main.sh",
    license: "MIT", homepage: "https://github.com/linkxzhou/SimpleCode",
    run: { asset: "shell-wasm", binaryName: "sh", args: ["{entry}"] },
  },
  {
    id: "rust", label: "Rust", short: "Rs", version: "weblings · 桌面", syntax: "rust", fileName: "main.rs",
    license: "MIT OR Apache-2.0", homepage: "https://github.com/AngelOnFira/weblings",
    compiler: "weblings",
    run: { fsPath: "/program.wasm", binaryName: "program", args: [] },
  },
  {
    id: "java",
    label: "Java",
    short: "Jv",
    version: "TeaVM",
    syntax: "java",
    fileName: "Main.java",
    license: "Apache-2.0",
    homepage: "https://github.com/konsoletyper/teavm",
    compiler: "teavm",
    // Not a WASI command. RunSession compiles and runs inside the TeaVM worker.
    run: { binaryName: "java", args: [] },
  },
  {
    id: "linux",
    label: "Linux",
    short: "Lx",
    version: "6.8.12",
    syntax: "shell",
    fileName: "main.sh",
    license: "BSD-2-Clause",
    homepage: "https://github.com/copy/v86",
    runtime: "v86",
    assets: ["v86-wasm", "v86-lib", "linux-bios", "linux-vgabios", "linux-bzimage", "linux-state"],
    // Not a WASI command. RunSession dispatches on runtime === "v86".
    run: { binaryName: "sh", args: [] },
  },
  {
    id: "numpy",
    label: "DeepLearning",
    short: "DL",
    version: "Python (NumPy)",
    syntax: "python",
    fileName: "main.py",
    license: "MPL-2.0",
    homepage: "https://pyodide.org/",
    compiler: "pyodide",
    assets: [
      "pyodide-mjs",
      "pyodide-asm-mjs",
      "pyodide-wasm",
      "pyodide-stdlib",
      "pyodide-lock",
      "pyodide-numpy",
      "pyodide-fashion",
      "pyodide-house",
      "pyodide-airfoil",
    ],
    // CPython 3.14 plus NumPy, in a worker. Not the WASI CPython used by Python.
    run: { binaryName: "python", args: [] },
  },
];

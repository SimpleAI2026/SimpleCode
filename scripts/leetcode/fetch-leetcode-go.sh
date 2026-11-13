#!/bin/sh
# Pin halfrost/LeetCode-Go into thirdparty/LeetCode-Go for the statement rewrite.
# The checkout is gitignored. The app never reads it.
# License of that repository: MIT, Copyright (c) 2017 halfrost.
set -eu

PIN="1dde49c8ab37a08f21a4fb249d7bd90af4a9c58e"
ROOT="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"
DEST="$ROOT/thirdparty/LeetCode-Go"
URL="https://github.com/halfrost/LeetCode-Go.git"

mkdir -p "$ROOT/thirdparty"

if [ ! -d "$DEST/.git" ]; then
  git clone --filter=blob:none --sparse "$URL" "$DEST"
fi

cd "$DEST"
git fetch --depth 1 origin "$PIN"
git checkout --detach "$PIN"
git sparse-checkout set --no-cone '/leetcode/**/README.md' '/LICENSE'

if ! grep -q "MIT License" LICENSE; then
  echo "expected an MIT license in $DEST/LICENSE" >&2
  exit 1
fi
if ! grep -q "Copyright (c) 2017 halfrost" LICENSE; then
  echo "expected the halfrost copyright line in $DEST/LICENSE" >&2
  exit 1
fi

count="$(find leetcode -name README.md | wc -l | tr -d ' ')"
echo "LeetCode-Go $PIN"
echo "README.md files: $count"
echo "license: MIT, Copyright (c) 2017 halfrost"
git rev-parse HEAD

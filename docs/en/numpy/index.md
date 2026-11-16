---
language: numpy
chapter: 0
title: "NumPy arrays"
minutes: 8
goals:
  - "Tell this runtime apart from WASI Python"
  - "Build a one-dimensional array"
  - "Read a multiplier from stdin"
sources:
  - numpy-manual
updated: "2026-10-20"
---

This book is about arrays. The NumPy sidebar row runs CPython 3.14 plus NumPy inside Pyodide and shares that worker and cache with the DeepLearning row beside it. It is not the WASI Python interpreter. Run executes only the snippet in front of you.

### Make one array

np.array takes a plain list and returns an ndarray. The first entry of shape is the length, and sum adds the values.

```numpy run expect="3 16" title="Three numbers"
import numpy as np
# Length and total
a = np.array([2, 5, 9])
print(a.shape[0], int(a.sum()))
```

The terminal prints 3 16.

### Stdin still works

input waits until the host writes a line into shared memory. This snippet reads an integer and multiplies by four. The fence supplies the line 3.

```numpy run expect="12" title="Times four" stdin="3\n"
n = int(input())
# Read a multiplier
print(n * 4)
```

The printed product is 12.

### Separate from the other Python

The WASI CPython build does not ship NumPy, so that import fails there. Keep array examples on the NumPy row. minitorch is written into the shared Pyodide filesystem, which the DeepLearning row uses as well.
### After chapter 11

ufuncs, boolean indexes, fancy indexes, sort and search, einsum, structured arrays, and vectorization follow the copy chapter. Timings jitter, so the vectorization chapter checks results and does not compare speed.

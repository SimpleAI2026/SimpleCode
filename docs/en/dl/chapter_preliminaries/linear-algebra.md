---
language: dl
chapter: 7
title: "Linear algebra"
level: beginner
minutes: 8
goals:
  - "Compute one cell of a product"
  - "Print a matrix norm"
  - "Compare a dot product with a length"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Matrix multiplication pairs each row on the left with a column on the right. A norm folds a table into one length. This section does not update parameters.

### Multiply two-by-two matrices

The first row on the left is 1 and 2. The first column on the right is 5 and 7. Their cell is 19. The norm of that same left matrix is printed to three decimals.

```numpy run expect="19 5.477" title="Matrix product"
# The first cell is 1*5+2*7
import numpy as np
a = np.array([[1.0, 2.0], [3.0, 4.0]])
b = np.array([[5.0, 6.0], [7.0, 8.0]])
c = a @ b
print(int(c[0, 0]), round(float(np.linalg.norm(a)), 3))
```

### Dot product and length

The dot product of 3 and 4 is 25, and the length is 5. A dot product multiplies matching positions and adds them. The length is the square root of that dot product.

```numpy run expect="25 5" title="Dot product"
# The integer 3-4-5 case
import numpy as np
v = np.array([3.0, 4.0])
print(int(np.dot(v, v)), int(np.linalg.norm(v)))
```

### Training also uses a transpose

A linear layer transposes its weight before multiplying by a batch. That step belongs with the regression implementation. Here the printed product and norm are the whole check.

Pages: [zh](https://zh.d2l.ai/chapter_preliminaries/linear-algebra.html) and [en](https://d2l.ai/chapter_preliminaries/linear-algebra.html).

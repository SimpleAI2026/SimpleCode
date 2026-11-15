---
language: dl
chapter: 5
title: "Array operations"
level: beginner
minutes: 8
goals:
  - "Read one cell by index"
  - "Sum an entire table"
  - "Average after a reshape"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

A tensor stores the cells. Indexing one site, summing every entry, changing the shape, and taking a mean are enough for the later minibatches.

### Pick one cell, then sum

In a two-by-three integer table, row 0 column 1 holds 2. The six cells add to 21. Indexing still returns a tensor, so the print converts that cell to a scalar.

```numpy run expect="2 21" title="Index and sum"
# Row 0, column 1
import minitorch as mt
grid = mt.tensor([[1, 2, 3], [4, 5, 6]])
print(int(grid[0, 1].item()), int(grid.sum().item()))
```

### Reshape, then average

After four numbers become two rows and two columns, both dimensions are 2 and the mean is 5. Reshaping does not invent new values. It only changes how the same entries are read.

```numpy run expect="2 2 5.0" title="Reshape and mean"
# Four numbers in a square
import minitorch as mt
row = mt.tensor([2.0, 4.0, 6.0, 8.0])
box = row.reshape(2, 2)
print(box.shape[0], box.shape[1], round(float(box.mean().item()), 1))
```

### Broadcasting stays with addition

When a scalar is added onto every row, the backward pass sums the extra axis away. This section only checks the printed shape. Gradient checks for broadcasting wait until automatic differentiation.

Pages: [zh](https://zh.d2l.ai/chapter_preliminaries/ndarray.html) and [en](https://d2l.ai/chapter_preliminaries/ndarray.html).

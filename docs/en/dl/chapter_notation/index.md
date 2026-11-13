---
language: dl
chapter: 2
title: "Notation"
level: beginner
minutes: 6
goals:
  - "Tell a single number from a column and a table"
  - "Read a shape as integers in parentheses"
  - "Remember that a gradient matches its parameter"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Later formulas share one way of speaking, so each example does not invent a new name. This page only fixes how to read a shape and a gradient. It does not derive a new result.

### One number and a column of numbers

A single real number is a scalar, such as the one number left after a loss. A column of numbers is a vector, such as the features on one sample. Several columns placed side by side are a matrix. Rows are often samples, and columns are features.

### A shape is integers in parentheses

A shape is written as integers inside parentheses. A vector of length 4 is (4,). A table of two rows and three columns is (2, 3). Reading the shape looks only at those integers, not at the decimals stored inside.

```numpy norun title="Shape is not printed yet"
# A later runnable section prints shapes.
print((2, 3))
```

### A gradient matches its parameter

A parameter is a number the model is prepared to change. A gradient is another group of numbers with the same shape. It says how sensitive the loss is to each parameter. This page does not run backpropagation. The read-only block records that pairing so it is not executed together with a later example.

```numpy norun title="Gradient is not computed"
# The gradient has the same shape as the parameter.
print("same-shape")
```

Further reading for notation: the [Chinese section](https://zh.d2l.ai/chapter_notation/index.html) and the [English section](https://d2l.ai/chapter_notation/index.html) of Dive into Deep Learning.

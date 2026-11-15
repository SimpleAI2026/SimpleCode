---
language: dl
chapter: 78
title: "Optimization"
level: intermediate
minutes: 6
goals:
  - "Expect several update rules"
  - "Keep the scalar examples at four steps"
  - "Treat the airfoil table as synthetic"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Optimization starts from an inequality on a convex function and continues through several step rules, then multiplies the learning rate. Only the airfoil section reads a table: 32 synthetic rows and four steps.

### Most examples are scalars

Gradient descent, momentum, AdaGrad, RMSProp, Adadelta, and Adam all move a parameter from 0 toward the target 3, and each stops after four steps.

### The opener does not update

The contents page has no parameter. The next two blocks are read-only. Each formula stays in its own section.

```numpy norun title="Optimization opener"
# The opener does not update
print('opt-open')
```

### The airfoil table is synthetic

Thirty-two rows, five inputs and one target, about two kilobytes. It is not the UCI file. The minibatch section standardizes it before the updates.

```numpy norun title="Airfoil table"
# Do not read the UCI file
print('airfoil-is-synthetic')
```

Pages: [zh](https://zh.d2l.ai/chapter_optimization/index.html) and [en](https://d2l.ai/chapter_optimization/index.html).

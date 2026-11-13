---
language: dl
chapter: 8
title: "Calculus"
level: beginner
minutes: 8
goals:
  - "Estimate a slope with a quotient"
  - "Check the derivative of a square at 3"
  - "Print sample points instead of a plot"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The slope of a square near 3 can be replaced by a difference of two nearby points. Sampling prints a few square values instead of drawing a curve.

### A difference quotient for the slope

The spacing is one ten-thousandth. The function gap divided by twice that spacing rounds to a number near 6, matching the derivative of a square at 3.

```numpy run expect="6.0" title="Difference quotient"
# Difference quotient of a square at 3
def square(x):
    return x * x
x = 3.0
h = 1e-4
slope = (square(x + h) - square(x - h)) / (2 * h)
print(round(slope, 4))
```

### Print three sample points

The squares of 0, 1, and 2 are 0, 1, and 4. The page does not load a plotting library, so the numbers that would have been drawn appear in the terminal.

```numpy run expect="0 1 4" title="Sample points"
# Squares of three integers
xs = [0.0, 1.0, 2.0]
print(" ".join(str(int(x * x)) for x in xs))
```

### Automatic derivatives come next

A difference quotient needs a chosen spacing. The next section lets a tensor record the gradient of a product, without a hand-written pair of points.

Pages: [zh](https://zh.d2l.ai/chapter_preliminaries/calculus.html) and [en](https://d2l.ai/chapter_preliminaries/calculus.html).

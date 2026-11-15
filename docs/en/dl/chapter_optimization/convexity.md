---
language: dl
chapter: 80
title: "Convexity"
level: intermediate
minutes: 8
goals:
  - "Check the convex inequality"
  - "Print the midpoint and the average"
  - "Read three squares"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

A square is convex: the value at the midpoint is no larger than the average of the values at the ends. Squares of three integers are printed beside that check.

### Midpoint and average

The midpoint of 1 and 3 is 2, and its square is 4. The average of the endpoint squares is 5. 4 is not above 5, which matches the inequality for a convex function.

```numpy run expect="4.0 5.0" title="Convex inequality"
# 4 against 5
def f(x):
    return x * x
mid = f(0.5 * 1.0 + 0.5 * 3.0)
avg = 0.5 * f(1.0) + 0.5 * f(3.0)
print(round(mid, 4), round(avg, 4))
```

### Squares of three points

The squares of -1, 0, and 1 are 1, 0, and 1. They are symmetric, so the function rises together on both sides of 0.

```numpy run expect="1 0 1" title="Three squares"
# Symmetric on both sides
xs = [-1.0, 0.0, 1.0]
print(" ".join(str(int(x * x)) for x in xs))
```

### Convexity does not replace four steps

Knowing the inequality still leaves a step size to choose. The next section uses a fixed step size to push a number from 4 toward 0, four times.

Pages: [zh](https://zh.d2l.ai/chapter_optimization/convexity.html) and [en](https://d2l.ai/chapter_optimization/convexity.html).

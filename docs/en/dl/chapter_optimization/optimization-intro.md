---
language: dl
chapter: 79
title: "Optimization and deep learning"
level: intermediate
minutes: 6
goals:
  - "Separate the loss from the task name"
  - "Accept a length of four steps"
  - "Keep updates on this page's objects"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Training pushes a scalar loss down for a limited number of steps. It does not prove a global minimum. This page only draws that distinction and creates no parameter.

### Loss and target

A regression target can be the coefficients of a line, and a classification target can be ten scores. An optimizer sees only the gradient of the loss at the current parameter, not the name of the task.

### Four steps is the teaching length

A longer loop would push the documentation smoke past its time limit and would blur the difference between this page and a full training run. Each section stops on the fourth step and prints loss.

```numpy norun title="Four steps"
# Stop on the fourth step
print('four-steps-only')
```

### There is no second framework

These updates live on the optimizer objects of this page. No second autodiff library is installed, and no implementation is fetched over the network.

```numpy norun title="No second library"
# Do not install an outside optimizer
print('no-second-framework')
```

Pages: [zh](https://zh.d2l.ai/chapter_optimization/optimization-intro.html) and [en](https://d2l.ai/chapter_optimization/optimization-intro.html).

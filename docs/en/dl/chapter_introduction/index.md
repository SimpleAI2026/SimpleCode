---
language: dl
chapter: 3
title: "Introduction"
level: beginner
minutes: 8
goals:
  - "Separate a sample, a prediction, and a loss"
  - "See that a check does not require a high accuracy"
  - "Remember that a training section takes four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The introduction keeps four ideas that later sections repeat: a small amount of data, a prediction function, one scalar loss, and only a few update steps. The formulas stay in their own chapters.

### Fit from a few samples

One sample is a group of inputs together with the output we hope to see. The playground does not drop in a whole image archive or a whole sentence archive. It keeps a few dozen rows, or fewer, so a shape and an interface can be checked.

### A prediction is a function

A model turns an input into a prediction. The simplest case multiplies weights by the input and adds a bias. Richer layers arrive in later chapters. This page does not hand out weights that are ready to reuse.

### A loss measures the gap

A loss folds the prediction and the target into one scalar. A classification example may also count how many rows match, but passing does not depend on a high accuracy. If the output shows a loss or a shape, the step has been reached.

```numpy norun title="Introduction does not compute a loss"
# A later section prints loss.
print("loss")
```

### An update takes four steps

A training section uses at most 32 training rows and at most 8 held-out rows, a batch of 4, and 4 optimizer steps. The introduction itself does not loop. The block below only names that count.

```numpy norun title="Introduction does not loop"
# Stop after four steps.
print(4)
```

Further reading for the introduction: the [Chinese section](https://zh.d2l.ai/chapter_introduction/index.html) and the [English section](https://d2l.ai/chapter_introduction/index.html) of Dive into Deep Learning.

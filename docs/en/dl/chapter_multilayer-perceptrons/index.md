---
language: dl
chapter: 20
title: "Multilayer perceptrons"
level: intermediate
minutes: 6
goals:
  - "Expect a rectifier in the middle"
  - "Keep training at four steps"
  - "Separate the price table from a contest file"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

This group puts a rectifier between linear layers, then walks the same 32 images for four steps. Underfitting, weight decay, dropout, numerical stability, and prices each get their own later section.

### Activation first, training second

A rectifier turns negatives into 0 and leaves positives unchanged. Both the from-scratch and the concise training sections use four steps and print acc once.

### The opener builds no network

The contents page has no parameters. The next two blocks are read-only so opening the chapter list does not run a backward pass.

```numpy norun title="Perceptron opener"
# The opener does not backpropagate
print('mlp-open')
```

### Prices use a synthetic tiny table

The price section reads the 16 plus 8 rows shipped with the page, not a contest spreadsheet. The columns are numeric features and the last column is the target.

```numpy norun title="Price table"
# The price table is not the contest file
print('house-is-synthetic')
```

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/index.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/index.html).

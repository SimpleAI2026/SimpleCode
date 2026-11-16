---
language: dl
chapter: 31
title: "Deep learning computation"
level: beginner
minutes: 6
goals:
  - "See that this group covers layers, parameters, and files"
  - "Remember parameters exist when the layer is built"
  - "Leave the GPU page as a read-only note"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

This group treats a network as blocks that can nest. It also says when parameters appear, how two layers can share one, and how to write them into one npz. The browser worker has no CUDA.

### Blocks and parameters

The following pages build a nested Sequential, inspect a shared weight, write a layer that scales its input, then store that weight in a file and read it back.

```numpy norun title="Blocks and parameters"
# The opener builds no layer
print("block-open")
```

### No device chapter here

Deferred initialization in other frameworks allocates a weight on the first forward. This runtime cannot do that, so one page says so. The GPU page does not run.

```numpy norun title="No device chapter here"
# The parameter page comes later
print("params-later")
```

### A file lasts for one run

The npz is written on the in-memory filesystem of this run. Opening another section does not promise the file is still there.

Pages: [zh](https://zh.d2l.ai/chapter_deep-learning-computation/index.html) and [en](https://d2l.ai/chapter_deep-learning-computation/index.html).

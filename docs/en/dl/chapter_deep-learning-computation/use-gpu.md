---
language: dl
chapter: 37
title: "No GPU"
level: intermediate
minutes: 6
goals:
  - "Know the worker has no CUDA"
  - "Convolution also runs on the same CPU arrays"
  - "These two blocks do not run"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

This Pyodide side has no GPU device and no API that copies a tensor into another memory. Convolution, pooling, and linear layers all use the same NumPy arrays.

### There is no device to switch

The code never mentions cuda or to(device). Writing that call would only raise an attribute error, so the block stays read-only.

```numpy norun title="There is no device to switch"
# There is no cuda attribute
print("no-gpu-here")
```

### Speed comes from a small batch

Four steps, a batch of four, and 28 by 28 keep the im2col matrix at a size the browser can multiply within a few seconds.

```numpy norun title="Speed comes from a small batch"
# Convolution stays on the CPU
print("cpu-only-conv")
```

### The numbers do not depend on a device

Cross-correlation with a fixed weight on this CPU implementation is the integer result used by the following sections.

Pages: [zh](https://zh.d2l.ai/chapter_deep-learning-computation/use-gpu.html) and [en](https://d2l.ai/chapter_deep-learning-computation/use-gpu.html).

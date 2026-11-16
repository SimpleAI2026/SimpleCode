---
language: dl
chapter: 96
title: "No multi-card wrapper"
level: intermediate
minutes: 6
goals:
  - "Call layers in written order"
  - "Let the training page slice the batch"
  - "Pass no device id to the constructor"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A short multi-card API usually wraps one module and replicates it onto a device list. That list is empty here, and the wrapper does not exist.

### Sequential is an ordinary object

Layers inside nn.Sequential run in the order they were written. There is no replicate-to-devices method and no device-list argument.

```numpy norun title="Sequential is an ordinary object"
# No device list
print("wrap-plain")
```

### The page slices four rows itself

A training page indexes four rows itself. No loader divides a larger batch across cards.

```numpy norun title="The page slices four rows itself"
# No multi-card loader
print("wrap-slice")
```

### SGD takes no device id

Runnable training pages construct the module and SGD directly. The wrapper page records that those constructors take no device id.

Pages: [zh](https://zh.d2l.ai/chapter_computational-performance/multiple-gpus-concise.html) and [en](https://d2l.ai/chapter_computational-performance/multiple-gpus-concise.html).

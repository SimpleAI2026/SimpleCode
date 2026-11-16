---
language: dl
chapter: 93
title: "No second device to split across"
level: intermediate
minutes: 6
goals:
  - "See the single CPU memory"
  - "Keep the batch unsplit"
  - "Leave parallelism in the title"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Automatic parallelism would place independent ops on different devices. This page has one CPU memory, so the scheduler has no second road.

### Loss and backward share one call chain

The loss waits for the forward values, and backward waits for the loss. Both happen on one Python call stack.

```numpy norun title="Loss and backward share one call chain"
# One call stack
print("par-chain")
```

### Four rows stay together

A batch of four rows is not cut in half for two chips. The shape stays as the author wrote it for the whole forward.

```numpy norun title="Four rows stay together"
# The batch stays whole
print("par-nosplit")
```

### The title's parallelism is not implemented

The automatic-parallelism page only records the missing second device. It does not pretend the matrix product was partitioned.

Pages: [zh](https://zh.d2l.ai/chapter_computational-performance/auto-parallelism.html) and [en](https://d2l.ai/chapter_computational-performance/auto-parallelism.html).

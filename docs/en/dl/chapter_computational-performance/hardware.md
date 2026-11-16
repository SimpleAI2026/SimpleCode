---
language: dl
chapter: 94
title: "Arrays stay in one memory"
level: intermediate
minutes: 6
goals:
  - "See one buffer, not host and device"
  - "Tie the batch of four to the time limit"
  - "Skip hardware counters"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A hardware chapter usually compares caches, device bandwidth, and kernel launch. Tensors here are NumPy arrays in the WebAssembly memory. There is no second device buffer.

### Convolution writes in the same buffer

Nothing copies an array from a host buffer to a device buffer and back. The im2col matrix lands in the same memory.

```numpy norun title="Convolution writes in the same buffer"
# One memory
print("hw-one")
```

### Four rows fit the smoke limit

Docs smoke must finish a fence within a fixed time. Training pages use four rows so the product on this memory ends in time, not because a bus bandwidth was measured.

```numpy norun title="Four rows fit the smoke limit"
# The limit is time, not bandwidth
print("hw-budget")
```

### Counters are not given to the page

Cache hits and device throughput need hardware counters. The browser does not hand those counters to this page, so the hardware section reports no bandwidth.

Pages: [zh](https://zh.d2l.ai/chapter_computational-performance/hardware.html) and [en](https://d2l.ai/chapter_computational-performance/hardware.html).

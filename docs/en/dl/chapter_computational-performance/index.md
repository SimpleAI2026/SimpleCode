---
language: dl
chapter: 90
title: "Performance, in outline"
level: intermediate
minutes: 6
goals:
  - "Treat all eight pages as reading"
  - "Name the missing compiler and devices"
  - "Leave timing out of the opener"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The performance group explains why this browser page has no compiled graph and no second device. All eight pages are for reading. The opener does not measure elapsed time.

### Eight pages stay explanatory

The array library writes each result before the Python call returns. It does not fold a network into a graph that a second compiler could rewrite, and it does not ship one batch to two chips.

```numpy norun title="Eight pages stay explanatory"
# The opener does not time a run
print("perf-open")
```

### Milliseconds do not describe a GPU

A tiny product could print a millisecond count, and that count would still describe only the open tab. It is not a GPU pipeline counter, so this group has no timing fence.

```numpy norun title="Milliseconds do not describe a GPU"
# No benchmark in this group
print("perf-no-bench")
```

### Each later page names one gap

Hybrid compilation, async queues, automatic placement, hardware counters, the two multi-card pages, and the parameter server each name one missing mechanism. The performance opener does not run those seven experiments.

Pages: [zh](https://zh.d2l.ai/chapter_computational-performance/index.html) and [en](https://d2l.ai/chapter_computational-performance/index.html).

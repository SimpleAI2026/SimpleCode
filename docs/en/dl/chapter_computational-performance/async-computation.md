---
language: dl
chapter: 92
title: "One run finishes before the next"
level: intermediate
minutes: 6
goals:
  - "See that no CUDA stream exists"
  - "See that Stop destroys the worker"
  - "Read the terminal in execution order"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Async computation would enqueue kernels on a device and synchronize later. This worker handles one Run at a time. Output returns to the terminal after that Run finishes.

### There is no second queue

No interface places two convolutions on two device streams. The next forward waits until the previous backward returns to Python.

```numpy norun title="There is no second queue"
# No device stream
print("async-one")
```

### Stop leaves no queued kernel

Stop ends the worker. No kernel that was already launched keeps writing an array in the background.

```numpy norun title="Stop leaves no queued kernel"
# Stop ends the worker
print("async-stop")
```

### Earlier text is the earlier step

The loss that appears first in the terminal comes from the step that finished first. The async page has no launch-then-sync reordering.

Pages: [zh](https://zh.d2l.ai/chapter_computational-performance/async-computation.html) and [en](https://d2l.ai/chapter_computational-performance/async-computation.html).

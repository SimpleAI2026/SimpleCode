---
language: dl
chapter: 136
title: "This page does not pick a GPU"
level: intermediate
minutes: 6
goals:
  - "Keep the runtime size fixed"
  - "Tie the batch to time, not memory"
  - "Write no shopping list"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Picking a server usually compares device memory, links, and budget. Computation on this page happens in the browser tab that opened it. There is no machine list.

### The sidebar stays on one download

The sidebar shows the same Pyodide download, about 15.8 MB. Moving to a computer with a GPU does not swap in a different runtime.

```numpy norun title="The sidebar stays on one download"
# The size is fixed
print("pick-fixed")
```

### Four rows are not a memory fit

Training sections use four steps and four rows so docs smoke ends within a fixed time. That shape is not a fit to one card's memory.

```numpy norun title="Four rows are not a memory fit"
# Time sets the batch
print("pick-time")
```

### Model names stay out of the text

Exact models and prices depend on the reader's own room and change quickly. The GPU-choice page lists no shopping items.

Pages: [zh](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/selecting-servers-gpus.html) and [en](https://d2l.ai/chapter_appendix-tools-for-deep-learning/selecting-servers-gpus.html).

---
language: dl
chapter: 91
title: "Eager calls, no compiled graph"
level: intermediate
minutes: 6
goals:
  - "See that forward runs at the call"
  - "See that no symbolic graph is exported"
  - "Skip a before-and-after timing"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Hybrid programming would capture imperative calls into a graph and compile that graph later. A linear layer on this page finishes when the call happens. There is no second compilation.

### The call writes the result immediately

The forward of nn.Linear already holds the matrix product before the next Python line runs. No switch records the layer for a later compiler.

```numpy norun title="The call writes the result immediately"
# No compile switch
print("hyb-eager")
```

### Gradients stay on the same chain

Backward walks from the loss through the layers just called. There is no step that exports the network as a separate executable and loads it again.

```numpy norun title="Gradients stay on the same chain"
# No graph export
print("hyb-nograph")
```

### There is no second timing column

A published comparison uses two timing columns, before and after compilation. This page has no compiler, so the second column cannot be filled. The eager-call page stays read-only.

Pages: [zh](https://zh.d2l.ai/chapter_computational-performance/hybridize.html) and [en](https://d2l.ai/chapter_computational-performance/hybridize.html).

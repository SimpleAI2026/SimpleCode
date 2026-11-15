---
language: dl
chapter: 11
title: "Looking up an API"
level: beginner
minutes: 8
goals:
  - "Open help on the linear layer"
  - "See weight decay on SGD"
  - "Leave outside manuals unread"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Help text covers only objects already placed in this worker. A linear layer and stochastic gradient descent with a weight-decay term are both visible. Manuals for an outside neural-network library are not.

### Inspect the linear layer

Help lists the class name and the two lengths used at construction. The linear layer on this page stores input and output sizes in the weight shape, and the bias length matches the output size.

```numpy run expect="Linear" title="Linear help"
# Only the linear layer on this page
import minitorch as mt
help(mt.nn.Linear)
```

### Inspect gradient descent

Stochastic gradient descent takes a learning rate and a weight-decay term. Decay defaults to 0. The later weight-decay section sets it to a positive number.

```numpy run expect="weight_decay" title="SGD help"
# Help should mention the decay argument
import minitorch as mt
help(mt.optim.SGD)
```

### The outside manual does not run

Some books send the reader to the web manual of another neural-network package. That address is not on this page. The next block keeps the note and does not perform a lookup.

```numpy norun title="Outside manual"
# torch.nn is not on this page
print("torch.nn docs are not on this page")
```

Pages: [zh](https://zh.d2l.ai/chapter_preliminaries/lookup-api.html) and [en](https://d2l.ai/chapter_preliminaries/lookup-api.html).

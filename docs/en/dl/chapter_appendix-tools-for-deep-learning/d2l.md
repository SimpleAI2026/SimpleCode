---
language: dl
chapter: 138
title: "Book names and the classes on this page"
level: intermediate
minutes: 6
goals:
  - "Keep the table local"
  - "Use this page's loss and data names"
  - "Read argument order from the source"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The book's layers and optimizers use another library's names. The table lists the classes this page actually constructs. The table is written here. The upstream manual stays in the link at the end.

### Layers and optimizers

Each short name is followed by the constructor in `minitorch`.

- A linear layer is nn.Linear, relu is nn.ReLU, dropout is nn.Dropout, and a stack is nn.Sequential.
- Convolution is nn.Conv2d, max pool is nn.MaxPool2d, average pool is nn.AvgPool2d, and flatten is nn.Flatten.
- Batch norm is nn.BatchNorm, an embedding is nn.Embedding, a recurrent layer is nn.RNN, and a gated recurrent layer is nn.GRU.
- Long short memory is nn.LSTM, layer norm is nn.LayerNorm, and multi-head attention is nn.MultiHeadAttention.
- An encoder block is nn.EncoderBlock, and a transposed convolution is nn.ConvTranspose2d.
- Minibatch gradient is optim.SGD, momentum is optim.Momentum, and adaptive gradient is optim.AdaGrad.
- Root mean square is optim.RMSProp, adaptive delta is optim.Adadelta, and adam is optim.Adam.

```numpy norun title="Layers and optimizers"
# The map lives here
print("map-local")
```

### Loss and sample functions

Multiclass loss is cross_entropy, and the binary form is bce_with_logits. Small samples come from datasets, and accuracy is accuracy. None of those names downloads weights.

```numpy norun title="Loss and sample functions"
# No weight download
print("map-noweight")
```

### Argument order is the source

The name-map page does not copy upstream keyword arguments. Constructor order and defaults follow minitorch.py in this repository.

Pages: [zh](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/d2l.html) and [en](https://d2l.ai/chapter_appendix-tools-for-deep-learning/d2l.html).

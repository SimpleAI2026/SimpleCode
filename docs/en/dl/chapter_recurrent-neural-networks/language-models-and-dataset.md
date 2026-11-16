---
language: dl
chapter: 56
title: "Language models and the dataset"
level: beginner
minutes: 8
goals:
  - "Cut 32 training windows"
  - "Keep 8 check windows"
  - "Use a batch of 4 by 4"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A language model predicts the next word. This page numbers the words and cuts fixed windows. It does not update any weight.

### Thirty-two plus eight

Each window holds 5 ids: the first 4 are the input, and the shift by one is the target. The first 32 windows train, and the next 8 check.

```numpy run expect="train 32" title="Thirty-two plus eight"
# Each window has length 5
import minitorch as mt
import numpy as np
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
vocab = sorted(set(words))
stoi = {w: i for i, w in enumerate(vocab)}
ids = np.array([stoi[w] for w in words], dtype=np.int64)
windows = []
for start in range(0, len(ids) - 4):
    windows.append(ids[start:start + 5])
    if len(windows) == 40:
        break
print("train", len(windows[:32]))
print("val", len(windows[32:40]))
```

### The shape of one batch

Take the first 4 training windows and drop the last id. The input is then 4 by 4.

```numpy run expect="batch 4 4" title="The shape of one batch"
# Four windows
import minitorch as mt
import numpy as np
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
vocab = sorted(set(words))
stoi = {w: i for i, w in enumerate(vocab)}
ids = np.array([stoi[w] for w in words], dtype=np.int64)
windows = []
for start in range(0, len(ids) - 4):
    windows.append(ids[start:start + 5])
    if len(windows) == 40:
        break
batch = np.stack([row[:-1] for row in windows[:4]])
print("batch", batch.shape[0], batch.shape[1])
```

### This page does not update weights

The dataset page only checks 32 training windows and a 4 by 4 batch. Weights wait for the scratch page and the concise page.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-neural-networks/language-models-and-dataset.html) and [en](https://d2l.ai/chapter_recurrent-neural-networks/language-models-and-dataset.html).

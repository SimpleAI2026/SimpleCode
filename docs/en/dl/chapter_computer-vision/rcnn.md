---
language: dl
chapter: 106
title: "Region pooling"
level: intermediate
minutes: 8
goals:
  - "Cut boxes on a 16 by 16 feature map"
  - "Pool each box to 2 by 2"
  - "Update the head and the features for four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

This region page has no selective search and no backbone weights. The features are a random map of shape 1 by 4 by 16 by 16. Four boxes are each pooled to 2 by 2 and then sent through a linear layer.

### Four steps after pooling

Each box is five numbers: batch index, left, top, right, and bottom, in feature-map pixels. The batch for the four steps is those four boxes. The features and the linear layer both step.

```numpy run expect="loss" title="Four steps after pooling"
# four steps after region pooling
import minitorch as mt
import numpy as np
np.random.seed(0)
feat = mt.tensor(np.random.randn(1, 4, 16, 16), requires_grad=True)
head = mt.nn.Linear(4 * 2 * 2, 2)
opt = mt.optim.SGD([feat] + head.parameters(), lr=0.1)
boxes = np.array([[0, 1, 1, 9, 9], [0, 4, 4, 14, 12], [0, 0, 2, 8, 10], [0, 6, 1, 15, 8]], dtype=np.float64)
labels = np.array([0, 1, 0, 1])
last = 0.0
for step in range(4):
    opt.zero_grad()
    pooled = mt.roi_pool(feat, boxes, 2).reshape(4, -1)
    loss = mt.cross_entropy(head(pooled), labels)
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### The output grid is 2

One box pools to 1 by 4 by 2 by 2. The channel count stays the feature channel count. On a blank map the pooled values are 0.

```numpy run expect="roi 1 4 2 0" title="The output grid is 2"
# pooled shape of one box
import minitorch as mt
import numpy as np
feat = mt.tensor(np.zeros((1, 4, 16, 16)))
boxes = np.array([[0, 1, 1, 9, 9]], dtype=np.float64)
pooled = mt.roi_pool(feat, boxes, 2)
print("roi", pooled.shape[0], pooled.shape[1], pooled.shape[2], int(pooled.data.reshape(-1)[0]))
```

### Candidate regions are not searched

The four boxes on the region-pooling page are written in by hand. There is no proposal algorithm on the pixels and no loaded classifier weights.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/rcnn.html) and [en](https://d2l.ai/chapter_computer-vision/rcnn.html).

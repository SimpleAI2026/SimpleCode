---
language: dl
chapter: 105
title: "A one-shot detection head"
level: intermediate
minutes: 8
goals:
  - "Keep a class convolution and a box convolution"
  - "Shrink the input edge to 32"
  - "Print only the loss across four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

This detection head is not a full multi-scale detector. One convolution and a pool shrink the edge from 32 to 16. The class convolution emits 2 channels and the box convolution emits 4. Eight images are trained, four per batch, and the two batches alternate across four steps.

### Class loss plus squared box error

The class target is background on almost every cell. Only cell (4, 4) is marked 1. The box target is all zeros, and that term is squared error. The printout is the sum of the two terms.

```numpy run expect="loss" title="Class loss plus squared box error"
# shortened detection head
import minitorch as mt
import numpy as np
np.random.seed(0)
images, _boxes, _labels, _vi, _vb, _vl = mt.detect_images()
body = mt.nn.Sequential(
    mt.nn.Conv2d(1, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
)
cls = mt.nn.Conv2d(4, 2, 1)
box = mt.nn.Conv2d(4, 4, 1)
params = body.parameters() + cls.parameters() + box.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    batch = images[start:start + 4]
    feat = body(mt.tensor(batch.astype(np.float64) / 255.0))
    scores = cls(feat).reshape(4 * 16 * 16, 2)
    pred = box(feat)
    target = np.zeros((4, 16, 16), dtype=np.int64)
    target[:, 4, 4] = 1
    loss_c = mt.cross_entropy(scores, target.reshape(-1))
    diff = pred - mt.tensor(np.zeros_like(pred.data))
    loss_b = (diff * diff).mean()
    loss = loss_c + loss_b
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### Channels of the two heads

On a feature map of edge 8, the class head has 2 channels, the box head has 4, and the spatial edge stays 8. This snippet does not backpropagate.

```numpy run expect="heads 2 4 8" title="Channels of the two heads"
# head shapes
import minitorch as mt
import numpy as np
np.random.seed(0)
feat = mt.tensor(np.zeros((1, 4, 8, 8)))
cls = mt.nn.Conv2d(4, 2, 1)
box = mt.nn.Conv2d(4, 4, 1)
print("heads", cls(feat).shape[1], box(feat).shape[1], cls(feat).shape[2])
```

### Matching is simplified

This one-shot page does not assign targets by overlap and does not stack several feature maps. A single cell on the class map is the positive, which is enough to finish four steps.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/ssd.html) and [en](https://d2l.ai/chapter_computer-vision/ssd.html).

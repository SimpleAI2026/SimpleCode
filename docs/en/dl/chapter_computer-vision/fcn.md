---
language: dl
chapter: 109
title: "A fully convolutional pass"
level: intermediate
minutes: 8
goals:
  - "Downsample and come back with a transposed convolution"
  - "Score two classes at every pixel"
  - "Repeat one batch for four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The fully convolutional page uses the four images from the segmentation sample. A pool shrinks the edge to 16, a transposed convolution of stride 2 restores 32, and a 1 by 1 convolution scores two classes at every pixel. All four steps use that same batch.

### Cross-entropy on the pixels

The output moves the channel axis to the end and then flattens into two columns. The label map flattens in the same order. The printed loss is the mean over every pixel.

```numpy run expect="loss" title="Cross-entropy on the pixels"
# four steps on four images
import minitorch as mt
import numpy as np
np.random.seed(0)
images, masks = mt.segment_images()
down = mt.nn.Sequential(
    mt.nn.Conv2d(1, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
)
up = mt.nn.ConvTranspose2d(4, 4, 2, stride=2)
head = mt.nn.Conv2d(4, 2, 1)
opt = mt.optim.SGD(down.parameters() + up.parameters() + head.parameters(), lr=0.1)
xb = mt.tensor(images.astype(np.float64) / 255.0)
last = 0.0
for step in range(4):
    opt.zero_grad()
    y = head(up(down(xb)))
    logits = y.permute(0, 2, 3, 1).reshape(-1, 2)
    loss = mt.cross_entropy(logits, masks.reshape(-1))
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### The edge returns to 32

A blank image of edge 32 is 16 after the pool. A transposed convolution with kernel 2 and stride 2 sends it back to 32. The channel count stays 1 in this shape check.

```numpy run expect="back 16 32" title="The edge returns to 32"
# down and back up
import minitorch as mt
import numpy as np
np.random.seed(0)
blank = mt.tensor(np.zeros((1, 1, 32, 32)))
down = mt.nn.MaxPool2d(2, stride=2)(blank)
up = mt.nn.ConvTranspose2d(1, 1, 2, stride=2)(down)
print("back", down.shape[2], up.shape[2])
```

### Not a per-pixel lookup

Scores on the fully convolutional page come from the convolution and the transposed convolution, not from a separate dense layer at each pixel. After four steps the page also does not look at what a segmentation picture would show.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/fcn.html) and [en](https://d2l.ai/chapter_computer-vision/fcn.html).

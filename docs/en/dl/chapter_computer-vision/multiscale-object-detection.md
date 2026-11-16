---
language: dl
chapter: 103
title: "Multi-scale detection"
level: intermediate
minutes: 8
goals:
  - "Read the edge after two pools"
  - "Count anchors on the 16 and 8 grids"
  - "Leave the detection head untrained here"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

On a picture with edge 32, one pool yields 16 and the next yields 8. The coarse grid suits a large object and the fine grid suits a small one. This page only checks edges and anchor counts.

### Two pools

The blank input is 1 by 1 by 32 by 32. The first pool has edge 16 and the second has edge 8. The channel count stays 1 here.

```numpy run expect="maps 16 8" title="Two pools"
# feature-map edges
import minitorch as mt
import numpy as np
x = mt.tensor(np.zeros((1, 1, 32, 32)))
h1 = mt.nn.MaxPool2d(2, stride=2)(x)
h2 = mt.nn.MaxPool2d(2, stride=2)(h1)
print("maps", h1.shape[2], h2.shape[2])
```

### Add the anchors from both maps

A 16 by 16 grid with one anchor per cell is 256. The 8 by 8 grid adds 64. The total is 320. Each grid uses one size and one ratio.

```numpy run expect="count 320" title="Add the anchors from both maps"
# anchors on both maps
import minitorch as mt
import numpy as np
fine = mt.multibox_prior(16, 16, [0.2], [1.0])
coarse = mt.multibox_prior(8, 8, [0.4], [1.0])
print("count", fine.shape[0] + coarse.shape[0])
```

### A count is not a detection

The multi-scale page has no class convolution and no box regression. 320 is the number of candidate cells, not a count of predicted objects.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/multiscale-object-detection.html) and [en](https://d2l.ai/chapter_computer-vision/multiscale-object-detection.html).

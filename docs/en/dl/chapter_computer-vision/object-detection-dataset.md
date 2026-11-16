---
language: dl
chapter: 104
title: "A detection sample"
level: intermediate
minutes: 8
goals:
  - "Read eight training images and two check images"
  - "Keep one box on each image"
  - "Keep the box width at 12"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The detection sample is ten gray images in memory, edge 32. Eight are for training and two are for a check. Each image has one box, and the label alternates between 0 and 1. This is not the banana archive.

### Shape of the training split

The eight images form a tensor of shape 8 by 1 by 32 by 32. The first box has width 12. Labels start at 0.

```numpy run expect="train 8 32 12 0" title="Shape of the training split"
# eight images and the first box
import minitorch as mt
import numpy as np
images, boxes, labels, _vi, _vb, _vl = mt.detect_images()
width = int(boxes[0, 2] - boxes[0, 0])
print("train", images.shape[0], images.shape[2], width, int(labels[0]))
```

### The check split has two images

The two held-out images are still edge 32 and single-channel. Their labels are 0 and 1. This page only checks the counts. It does not update weights.

```numpy run expect="check 2 2 0 1" title="The check split has two images"
# two check images
import minitorch as mt
import numpy as np
_images, _boxes, _labels, vi, vb, vl = mt.detect_images()
print("check", vi.shape[0], int(vb.shape[0]), int(vl[0]), int(vl[1]))
```

### One box is enough for the demo

The detection sample does not stack many overlapping boxes. The next page attaches a class map and a box map to this edge and still takes only four steps.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/object-detection-dataset.html) and [en](https://d2l.ai/chapter_computer-vision/object-detection-dataset.html).

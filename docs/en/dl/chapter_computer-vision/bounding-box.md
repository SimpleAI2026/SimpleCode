---
language: dl
chapter: 101
title: "Bounding boxes"
level: intermediate
minutes: 8
goals:
  - "Record a box by its two corners"
  - "Width and height are the edge differences"
  - "Area is width times height"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A box is four numbers: left, top, right, and bottom. This page is geometry only. It does not draw on a photo and it does not guess a class.

### Width and height

Left 2, top 3, right 10, bottom 8. The width is 8 and the height is 5. This page subtracts the corners directly.

```numpy run expect="size 8 5" title="Width and height"
# width and height from two corners
import minitorch as mt
import numpy as np
box = np.array([2.0, 3.0, 10.0, 8.0])
wh = box[2:] - box[:2]
print("size", int(wh[0]), int(wh[1]))
```

### Area

The same box has area 40. Intersection over union uses that area later. This page only writes the product.

```numpy run expect="area 40" title="Area"
# width times height
import minitorch as mt
import numpy as np
box = np.array([2.0, 3.0, 10.0, 8.0])
wh = box[2:] - box[:2]
print("area", int(wh[0] * wh[1]))
```

### Coordinates come before the class

The bounding-box page does not attach a label and does not paint the box into pixels. The detection-data page is where a box sits with an image.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/bounding-box.html) and [en](https://d2l.ai/chapter_computer-vision/bounding-box.html).

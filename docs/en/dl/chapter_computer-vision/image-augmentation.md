---
language: dl
chapter: 99
title: "Image augmentation"
level: intermediate
minutes: 8
goals:
  - "Take one clothing photo already on disk"
  - "Match a corner after a left-right flip"
  - "Crop the center to 20 by 20"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Augmentation here uses only the first photo in the pinned clothing subset. The edge is 28. The left-right flip and the center crop are NumPy. No image library is installed.

### A left-right flip meets the corner

Row 14, column 25 of the first photo is 255. After a horizontal flip that bright pixel lands in column 2. Both positions print 255.

```numpy run expect="bright 255 255" title="A left-right flip meets the corner"
# flip one clothing photo
import minitorch as mt
import numpy as np
images, labels, _test_x, _test_y = mt.fashion_mnist()
pic = images[0].reshape(28, 28)
flipped = np.flip(pic, axis=1)
print("bright", int(pic[14, 25]), int(flipped[14, 2]), int(labels[0]))
```

### Crop away the outer ring

Four pixels come off each edge, leaving 20 by 20. The crop sums to 56684, which checks that the slice is the same photo.

```numpy run expect="crop 20 20 56684" title="Crop away the outer ring"
# center 20 by 20
import minitorch as mt
import numpy as np
images, _labels, _test_x, _test_y = mt.fashion_mnist()
pic = images[0].reshape(28, 28)
crop = pic[4:24, 4:24]
print("crop", crop.shape[0], crop.shape[1], int(crop.sum()))
```

### No random pipeline on this page

Color jitter, a random crop ratio, and batching the tiles stay off this page. The clothing augmentation only shows a flip and one fixed crop, so the numbers can be checked.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/image-augmentation.html) and [en](https://d2l.ai/chapter_computer-vision/image-augmentation.html).

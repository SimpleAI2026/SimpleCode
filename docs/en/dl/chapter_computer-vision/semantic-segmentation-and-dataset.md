---
language: dl
chapter: 107
title: "A segmentation sample"
level: intermediate
minutes: 8
goals:
  - "Read four images and four label maps"
  - "Mark the center square as class 1"
  - "Count the pixels of both classes"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The segmentation sample is four gray 32 by 32 images, each with a label map of the same size. The center 16 by 16 is class 1 and the rest is 0. This is not VOC.

### Images and labels come in pairs

The four images have edge 32. The middle of a label map is 1 and the top-left corner is 0. There is a single channel.

```numpy run expect="pair 4 32 1 0" title="Images and labels come in pairs"
# four image and label pairs
import minitorch as mt
import numpy as np
images, masks = mt.segment_images()
print("pair", images.shape[0], images.shape[2], int(masks[0, 10, 10]), int(masks[0, 0, 0]))
```

### How many pixels each class has

Each image has 1024 pixels, and 256 of them in the center are class 1. Across four images, class 0 has 3072 pixels and class 1 has 1024.

```numpy run expect="counts 3072 1024" title="How many pixels each class has"
# pixel counts
import minitorch as mt
import numpy as np
_images, masks = mt.segment_images()
print("counts", int((masks == 0).sum()), int((masks == 1).sum()))
```

### Label maps are not a separate file

The segmentation sample is generated in memory together with the images. There is no second archive. The fully convolutional page uses these four pairs and repeats the same batch for four steps.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/semantic-segmentation-and-dataset.html) and [en](https://d2l.ai/chapter_computer-vision/semantic-segmentation-and-dataset.html).

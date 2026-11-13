---
language: dl
chapter: 17
title: "Image classification data"
level: beginner
minutes: 8
goals:
  - "Read a 32 by 784 training table"
  - "Confirm eight check images"
  - "Convert only a batch of four to floats"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-13"
---

Clothing images keep 32 training rows and 8 check rows. Each row is a 28 by 28 gray byte image. The read values stay integers from 0 to 255. Scaling happens only on the four rows that are taken out.

### Shape and label range

The training tensor has 32 rows and 784 columns, and the check set has 8 rows. The smallest and largest labels fall inside 0 through 9. This block builds no network.

```numpy run expect="shape 32 784 8" title="Data shape"
# 32 training images and 8 check images
import minitorch as mt
x, y, xt, yt = mt.datasets.fashion_mnist()
print("shape", x.shape[0], x.shape[1], xt.shape[0], int(y.min()), int(y.max()))
```

### Scale only four images

The first four images, divided by 255, land between 0 and 1. The other twenty-eight stay bytes, so a larger file swapped in later is not expanded to floats all at once.

```numpy run expect="batch 4" title="Batch scale"
# Convert one batch of four
import minitorch as mt
x, y, xt, yt = mt.datasets.fashion_mnist()
batch = mt.datasets.scale_batch(x[:4])
print("batch", batch.shape[0], round(float(batch.min()), 3), round(float(batch.max()), 3))
```

### The original collection has sixty thousand images

The file on the page is the leading rows of the original training order and the original test order, not a redrawn set. The full sixty thousand and ten thousand are not part of the sidebar download.

Pages: [zh](https://zh.d2l.ai/chapter_linear-networks/image-classification-dataset.html) and [en](https://d2l.ai/chapter_linear-networks/image-classification-dataset.html).

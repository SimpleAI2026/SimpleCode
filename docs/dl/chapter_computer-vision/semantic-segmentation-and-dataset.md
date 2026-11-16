---
language: dl
chapter: 107
title: "分割样本"
level: intermediate
minutes: 8
goals:
  - "读四张图和四张标签图"
  - "中心方块是类别 1"
  - "数清两类像素"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

分割样本是四张 32 乘 32 的灰图，每张配一张同样大小的标签图。中心 16 乘 16 是类别 1，其余是 0。这不是 VOC。

### 图和标签成对

四张图的边是 32。标签图正中是 1，左上角是 0。通道只有 1。

```numpy run expect="pair 4 32 1 0" title="图和标签成对"
# 四对图和标签
import minitorch as mt
import numpy as np
images, masks = mt.segment_images()
print("pair", images.shape[0], images.shape[2], int(masks[0, 10, 10]), int(masks[0, 0, 0]))
```

### 两类像素的个数

每张图 1024 个像素，中心 256 个是类别 1。四张合起来，类别 0 有 3072 个，类别 1 有 1024 个。

```numpy run expect="counts 3072 1024" title="两类像素的个数"
# 像素计数
import minitorch as mt
import numpy as np
_images, masks = mt.segment_images()
print("counts", int((masks == 0).sum()), int((masks == 1).sum()))
```

### 标签图不另存文件

分割样本和图像一起在内存里生成，没有第二份压缩包。全卷积那一页会用这四对，重复同一批走四步。

延伸阅读：[分割样本](https://zh.d2l.ai/chapter_computer-vision/semantic-segmentation-and-dataset.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/semantic-segmentation-and-dataset.html)。

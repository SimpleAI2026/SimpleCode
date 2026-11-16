---
language: dl
chapter: 104
title: "检测数据"
level: intermediate
minutes: 8
goals:
  - "读八张训练图和两张检查图"
  - "每张图一只框"
  - "框宽固定是 12"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

检测数据是内存里的十张灰图，边长 32。前八张训练，后两张检查。每张图一只框，标签在 0 和 1 之间交替。这不是香蕉压缩包。

### 训练集的形状

八张图的张量是 8 乘 1 乘 32 乘 32。第一只框的宽是 12。标签从 0 开始。

```numpy run expect="train 8 32 12 0" title="训练集的形状"
# 八张图和第一只框
import minitorch as mt
import numpy as np
images, boxes, labels, _vi, _vb, _vl = mt.detect_images()
width = int(boxes[0, 2] - boxes[0, 0])
print("train", images.shape[0], images.shape[2], width, int(labels[0]))
```

### 检查集只有两张

留下的两张仍是 32 边长、单通道。它们的标签是 0 和 1。这一页只核对数量，不更新权重。

```numpy run expect="check 2 2 0 1" title="检查集只有两张"
# 两张检查图
import minitorch as mt
import numpy as np
_images, _boxes, _labels, vi, vb, vl = mt.detect_images()
print("check", vi.shape[0], int(vb.shape[0]), int(vl[0]), int(vl[1]))
```

### 一只框就够演示

检测样本不堆很多重叠的框。下一页的检测头会把类别图和框图接到这种边长上，仍然只走四步。

延伸阅读：[检测数据](https://zh.d2l.ai/chapter_computer-vision/object-detection-dataset.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/object-detection-dataset.html)。

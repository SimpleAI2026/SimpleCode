---
language: dl
chapter: 101
title: "边界框"
level: intermediate
minutes: 8
goals:
  - "用左上角和右下角记一个框"
  - "宽高是两边的差"
  - "面积是宽乘高"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

框用四个数：左、上、右、下。这一页只做几何，不画到图上，也不估计类别。

### 宽和高

左 2、上 3、右 10、下 8。宽是 8，高是 5。右和下不包含在跨度的另一套记法里，这里直接相减。

```numpy run expect="size 8 5" title="宽和高"
# 两个角算出宽高
import minitorch as mt
import numpy as np
box = np.array([2.0, 3.0, 10.0, 8.0])
wh = box[2:] - box[:2]
print("size", int(wh[0]), int(wh[1]))
```

### 面积

同一只框的面积是 40。后面交并比会用这个面积，这一页先把乘法写出来。

```numpy run expect="area 40" title="面积"
# 宽乘高
import minitorch as mt
import numpy as np
box = np.array([2.0, 3.0, 10.0, 8.0])
wh = box[2:] - box[:2]
print("area", int(wh[0] * wh[1]))
```

### 坐标先于类别

边界框这一页不给框贴标签，也不把框画进像素。检测数据那一页才会把框和图像放在一起。

延伸阅读：[边界框](https://zh.d2l.ai/chapter_computer-vision/bounding-box.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/bounding-box.html)。

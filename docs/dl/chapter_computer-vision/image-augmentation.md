---
language: dl
chapter: 99
title: "图像增广"
level: intermediate
minutes: 8
goals:
  - "取已有衣服图的一张"
  - "左右翻转后角点对齐"
  - "中心裁成 20 乘 20"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

增广这里只用已经钉住的衣服子集里的第一张，边长 28。左右翻转和中心裁剪都用 NumPy，不装图像库。

### 左右翻转要对上角点

第一张图第 14 行第 25 列是 255。水平翻转后，这个亮点落到第 2 列。两个位置都打印 255。

```numpy run expect="bright 255 255" title="左右翻转要对上角点"
# 一张衣服图的翻转
import minitorch as mt
import numpy as np
images, labels, _test_x, _test_y = mt.fashion_mnist()
pic = images[0].reshape(28, 28)
flipped = np.flip(pic, axis=1)
print("bright", int(pic[14, 25]), int(flipped[14, 2]), int(labels[0]))
```

### 中心裁掉一圈

四边各去掉 4 个像素，剩下 20 乘 20。裁剪块的像素和是 56684，用来确认切的是同一张图。

```numpy run expect="crop 20 20 56684" title="中心裁掉一圈"
# 中心 20 乘 20
import minitorch as mt
import numpy as np
images, _labels, _test_x, _test_y = mt.fashion_mnist()
pic = images[0].reshape(28, 28)
crop = pic[4:24, 4:24]
print("crop", crop.shape[0], crop.shape[1], int(crop.sum()))
```

### 不在这里加随机流水线

颜色抖动、随机裁剪比例和批量拼接都不进这一页。衣服图增广只演示翻转和一次固定裁剪，数字可以对照。

延伸阅读：[图像增广](https://zh.d2l.ai/chapter_computer-vision/image-augmentation.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/image-augmentation.html)。

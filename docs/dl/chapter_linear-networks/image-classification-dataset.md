---
language: dl
chapter: 17
title: "图像分类数据集"
level: beginner
minutes: 8
goals:
  - "读出 32 乘 784 的训练表"
  - "确认检查集有 8 张"
  - "只把一批四张转成浮点"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-13"
---

服装图片只留训练 32 张、检查 8 张，每张 28 乘 28 的灰度字节。读出来仍是 0 到 255 的整数，缩放留到取出的那四张上。

### 形状和标签范围

训练张量是 32 行、784 列，检查集有 8 行。标签最小和最大都落在 0 到 9。这一段不建网络。

```numpy run expect="shape 32 784 8" title="数据形状"
# 32 张训练和 8 张检查
import minitorch as mt
x, y, xt, yt = mt.datasets.fashion_mnist()
print("shape", x.shape[0], x.shape[1], xt.shape[0], int(y.min()), int(y.max()))
```

### 只缩放四张

前四张除以 255 之后落在 0 和 1 之间。其余二十八张保持字节，避免以后有人换回大文件时一次把整表变成浮点。

```numpy run expect="batch 4" title="批量缩放"
# 一批四张再转浮点
import minitorch as mt
x, y, xt, yt = mt.datasets.fashion_mnist()
batch = mt.datasets.scale_batch(x[:4])
print("batch", batch.shape[0], round(float(batch.min()), 3), round(float(batch.max()), 3))
```

### 原库有六万张

页面里的文件是原训练序和原测试序的前几张，不是另一套重画的图。完整的六万张和一万张都不放进侧栏下载。

延伸阅读：[图像分类数据集](https://zh.d2l.ai/chapter_linear-networks/image-classification-dataset.html)，英文页在[这里](https://d2l.ai/chapter_linear-networks/image-classification-dataset.html)。

---
language: dl
chapter: 98
title: "计算机视觉"
level: intermediate
minutes: 8
goals:
  - "知道这一组写检测和分割"
  - "分清全写、缩短和只读"
  - "图片在内存里现画"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

这一组从一张衣服照片的翻转讲到框、锚、检测头、像素标签和风格损失。能跑的页用很小的数组。开篇不训练。

### 先看任务再看页型

增广、微调和两个比赛页是缩短页。框、锚、多尺度和转置卷积按公式写全。后面的检测和分割只留四步。

```numpy norun title="先看任务再看页型"
# 开篇不训练
import minitorch as mt
import numpy as np
print("vision-open")
```

### 样本不进压缩包

微调、检测、分割和两个分类替身都由固定种子在内存里画出来。页面不下载热狗、香蕉、VOC 或比赛压缩包。

```numpy norun title="样本不进压缩包"
# 压缩包不下载
import minitorch as mt
import numpy as np
print("vision-later")
```

### 只读页停在约定

视觉这一组的开篇只约定页型和数据从哪来。权重、框和损失都留在后面的各节，不在这里开跑。

延伸阅读：[计算机视觉](https://zh.d2l.ai/chapter_computer-vision/index.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/index.html)。

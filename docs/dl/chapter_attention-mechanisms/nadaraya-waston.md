---
language: dl
chapter: 72
title: "核回归"
level: beginner
minutes: 8
goals:
  - "用高斯核对五个点加权"
  - "查询放在 3"
  - "核对权重和预测"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

核回归把查询附近的点加权平均。权重来自高斯核，距离越近越大。这一页的五个点是手写的。

### 查询自己的权重

五个横坐标是 1 到 5，查询是 3。离查询最近的那个点拿走最大的一份权重。

```numpy run expect="weight 0.4026" title="查询自己的权重"
# 高斯核
import numpy as np
x = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
query = 3.0
w = np.exp(-0.5 * (x - query) ** 2)
w = w / w.sum()
print("weight", round(float(w[2]), 4))
```

### 加权之后的预测

五个纵坐标和同一组权重相乘再相加。结果落在这些纵坐标的中间。

```numpy run expect="pred 2.0156" title="加权之后的预测"
# 五个点
import numpy as np
x = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
y = np.array([1.0, 2.0, 1.5, 3.0, 2.5])
query = 3.0
w = np.exp(-0.5 * (x - query) ** 2)
w = w / w.sum()
print("pred", round(float((w * y).sum()), 4))
```

### 这是注意力的一个特例

核回归的键就是横坐标，值就是纵坐标。核回归这一页到预测值 2.0156 为止，不进入句子。

延伸阅读：[核回归](https://zh.d2l.ai/chapter_attention-mechanisms/nadaraya-waston.html)，英文页在[这里](https://d2l.ai/chapter_attention-mechanisms/nadaraya-waston.html)。

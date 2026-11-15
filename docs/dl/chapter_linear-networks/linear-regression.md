---
language: dl
chapter: 13
title: "线性回归"
level: beginner
minutes: 8
goals:
  - "用最小二乘拟合直线"
  - "读出截距和斜率"
  - "核对残差平方平均"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

四个点落在 y = 1 + 2x 上。用最小二乘可以直接解出截距和斜率，残差平方的平均是 0。

### 解出截距和斜率

设计矩阵第一列全是 1，第二列是 1 到 4。最小二乘给出的两个系数四舍五入后是 1 和 2，和造数据时用的式子一致。

```numpy run expect="1.0 2.0" title="最小二乘"
# 四点正好在直线上
import numpy as np
x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.0, 5.0, 7.0, 9.0])
design = np.column_stack([np.ones(4), x])
w, _, _, _ = np.linalg.lstsq(design, y, rcond=None)
print(round(float(w[0]), 2), round(float(w[1]), 2))
```

### 残差是零

用同一条直线再预测这四个 x，预测和目标完全重合。平均平方差打印成 loss 0。这一节没有随机噪声。

```numpy run expect="loss 0.0" title="零残差"
# 预测和目标重合
import numpy as np
x = np.array([1.0, 2.0, 3.0, 4.0])
y = 1.0 + 2.0 * x
pred = 1.0 + 2.0 * x
print("loss", round(float(np.mean((pred - y) ** 2)), 4))
```

### 下一节改成逐步更新

闭式解一次就把系数算完。从零实现改成四次小步，每步只看当前损失对权重的梯度。

延伸阅读：[线性回归](https://zh.d2l.ai/chapter_linear-networks/linear-regression.html)，英文页在[这里](https://d2l.ai/chapter_linear-networks/linear-regression.html)。

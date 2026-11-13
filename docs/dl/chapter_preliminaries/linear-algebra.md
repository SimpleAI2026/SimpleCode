---
language: dl
chapter: 7
title: "线性代数"
level: beginner
minutes: 8
goals:
  - "算出矩阵乘的一格"
  - "打印矩阵范数"
  - "对照向量内积和长度"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

矩阵乘法把左边的行和右边的列合成新格子。范数把一张表收成一个长度。这一节不做参数更新。

### 两行两列相乘

左边第一行是 1 和 2，右边第一列是 5 和 7，对应格子是 19。同一张左边矩阵的范数保留三位小数。

```numpy run expect="19 5.477" title="矩阵乘"
# 第一格是 1*5+2*7
import numpy as np
a = np.array([[1.0, 2.0], [3.0, 4.0]])
b = np.array([[5.0, 6.0], [7.0, 8.0]])
c = a @ b
print(int(c[0, 0]), round(float(np.linalg.norm(a)), 3))
```

### 向量的内积和长度

3 和 4 的内积是 25，长度是 5。内积是对应位置相乘再相加，长度是内积开平方，两个数一起印出来方便对照。

```numpy run expect="25 5" title="内积"
# 3-4-5 的整数例子
import numpy as np
v = np.array([3.0, 4.0])
print(int(np.dot(v, v)), int(np.linalg.norm(v)))
```

### 训练时还会见到转置

线性层把权重转置后再和批量相乘。那一步留在回归的实现里。这里只确认乘法和范数的打印值。

延伸阅读：[线性代数](https://zh.d2l.ai/chapter_preliminaries/linear-algebra.html)，英文页在[这里](https://d2l.ai/chapter_preliminaries/linear-algebra.html)。

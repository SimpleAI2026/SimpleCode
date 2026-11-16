---
language: dl
chapter: 54
title: "序列"
level: beginner
minutes: 8
goals:
  - "从等差数列推出下一项"
  - "把 16 个数排成 4 乘 4"
  - "序列先于文本出现"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

序列是按时间排好的数。这一页不读文本，只用一条步长固定的数列，再把十六个数排成四行。

### 步长和下一项

相邻两项相差 2。最后一项是 9，再走一步就是 11。

```numpy run expect="next 11.0" title="步长和下一项"
# 固定步长
import numpy as np
x = np.array([1.0, 3.0, 5.0, 7.0, 9.0])
step = x[1] - x[0]
print("step", step)
print("next", x[-1] + step)
```

### 排成一个小批量

十六个连续整数排成 4 行 4 列，行就是后来的批量那一维。

```numpy run expect="shape 4 4" title="排成一个小批量"
# 四行四列
import numpy as np
raw = np.arange(16, dtype=np.float64)
batch = raw.reshape(4, 4)
print("shape", batch.shape[0], batch.shape[1])
```

### 文本还没出现

这里的序列是手写的数字。下一页才把合成句子切成词。序列这一页到等差数列的下一步为止。

延伸阅读：[序列](https://zh.d2l.ai/chapter_recurrent-neural-networks/sequence.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-neural-networks/sequence.html)。

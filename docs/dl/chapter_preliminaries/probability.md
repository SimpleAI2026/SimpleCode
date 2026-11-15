---
language: dl
chapter: 10
title: "概率"
level: beginner
minutes: 8
goals:
  - "用块内发生器抽样"
  - "固定种子让输出可重复"
  - "打印样本平均"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

抽样用块内新建的发生器，种子写死，这样每次运行的打印都一样。不要去碰会留到下一次运行的全局随机流。

### 抛八次硬币

发生器种子是 0，每次在 0 和 1 里取一个整数，一共八次。打印正面的次数和总次数。次数由种子决定，不是现场再摇一次。

```numpy run expect="draws 3 8" title="抛硬币"
# 种子 0 的八次抛掷
import numpy as np
rng = np.random.default_rng(0)
draws = rng.integers(0, 2, size=8)
print("draws", int(draws.sum()), int(draws.size))
```

### 十六个正态样本的平均

另一个发生器用种子 1，从标准正态里取十六个数，只打印它们的平均。平均接近 0，但这一次的三位小数由种子钉死。

```numpy run expect="mean 0.128" title="样本平均"
# 种子 1 的正态样本
import numpy as np
rng = np.random.default_rng(1)
samples = rng.normal(0.0, 1.0, size=16)
print("mean", round(float(samples.mean()), 3))
```

### 分类标签不是概率本身

后面的图片标签是 0 到 9 的整数。把分数变成概率要等 softmax 那一节。这里只确认抽样打印稳定。

延伸阅读：[概率](https://zh.d2l.ai/chapter_preliminaries/probability.html)，英文页在[这里](https://d2l.ai/chapter_preliminaries/probability.html)。

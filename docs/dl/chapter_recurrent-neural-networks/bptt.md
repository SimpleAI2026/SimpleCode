---
language: dl
chapter: 60
title: "沿时间回传"
level: beginner
minutes: 8
goals:
  - "展开三条时间"
  - "看隐藏到隐藏的梯度"
  - "不在这里做四步训练"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

沿时间回传就是把三个时间步连成一张图，再对标量损失求导。这一页用宽度 1 的单元，避免长序列。

### 三条时间

输入是 1 乘 3 乘 1。输出的时间维也是 3，说明循环确实走完了三步。

```numpy run expect="steps 3" title="三条时间"
# 长度 3
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((1, 3, 1)))
y, _ = mt.nn.RNN(1, 1)(x)
print("steps", y.shape[1])
```

### 隐藏权重收到梯度

三步输出求和之后反向。打印的是隐藏到隐藏那一个权重的梯度。

```numpy run expect="grad" title="隐藏权重收到梯度"
# 对三步求和
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.array([[[0.5], [-0.2], [0.1]]]))
rnn = mt.nn.RNN(1, 1)
y, _ = rnn(x)
y.sum().backward()
print("grad", round(float(rnn.weight_hh.grad.reshape(-1)[0]), 4))
```

### 这里不进入数据集

沿时间回传只演示长度 3 的图。四步训练留在从零实现和简洁实现，不在这一页重复。

延伸阅读：[沿时间回传](https://zh.d2l.ai/chapter_recurrent-neural-networks/bptt.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-neural-networks/bptt.html)。

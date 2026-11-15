---
language: dl
chapter: 36
title: "参数存成 npz"
level: beginner
minutes: 8
goals:
  - "把权重写进 npz"
  - "清掉内存里的数再读回"
  - "确认读回的矩阵一致"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

同一轮运行里可以把参数写进 /data 下的 npz，再读回来。这不是节与节之间的约定，换一节之后文件不一定还在。

### 写盘再覆盖读回

先记下初始权重，存档，把内存里的权重改成 0，再从文件填回去。allclose 为真时打印 1。

```numpy run expect="match 1" title="写盘再覆盖读回"
# 同一轮里写和读
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Linear(2, 1)
before = layer.weight.data.copy()
mt.save_npz("/data/sc-params.npz", {"w": layer.weight, "b": layer.bias})
layer.weight.data[:] = 0
loaded = mt.load_npz("/data/sc-params.npz")
layer.weight.data[:] = loaded["w"]
print("match", int(np.allclose(layer.weight.data, before)))
```

### 偏置也在文件里

字典的键是调用时起的名字。偏置那一项长度是 1，和线性层的输出维相同。

```numpy run expect="bias 1" title="偏置也在文件里"
# 只存偏置
import minitorch as mt
import numpy as np
np.random.seed(1)
layer = mt.nn.Linear(2, 1)
mt.save_npz("/data/sc-bias.npz", {"b": layer.bias})
loaded = mt.load_npz("/data/sc-bias.npz")
print("bias", int(loaded["b"].shape[0]))
```

### 不要依赖下一次打开

Worker 的文件系统停在这一次页面会话的内存里。刷新或换语言运行时，不应假设 npz 还在。

延伸阅读：[参数存成 npz](https://zh.d2l.ai/chapter_deep-learning-computation/read-write.html)，英文页在[这里](https://d2l.ai/chapter_deep-learning-computation/read-write.html)。

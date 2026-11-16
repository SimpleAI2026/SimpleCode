---
language: dl
chapter: 67
title: "编码器和解码器"
level: beginner
minutes: 8
goals:
  - "用编码器的末状态启动解码器"
  - "批量是 2、时间是 4"
  - "这一页不看句子"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

编码器把一整段输入收成一个隐藏状态，解码器从这个状态接着走。这一页用零张量把接口的形状钉住。

### 末状态的形状

两条长度 4、特征 4 的输入，隐藏宽度也是 4。末状态是 2 乘 4，没有时间维。

```numpy run expect="state 2 4" title="末状态的形状"
# 只留最后状态
import minitorch as mt
import numpy as np
np.random.seed(0)
enc = mt.nn.RNN(4, 4)
src = mt.tensor(np.zeros((2, 4, 4)))
_y, h = enc(src)
print("state", h.shape[0], h.shape[1])
```

### 解码器接着走

把这个状态交给另一个 RNN，输出又变回带时间的 2 乘 4 乘 4。

```numpy run expect="out 2 4 4" title="解码器接着走"
# 状态传给解码器
import minitorch as mt
import numpy as np
np.random.seed(0)
enc = mt.nn.RNN(4, 4)
dec = mt.nn.RNN(4, 4)
src = mt.tensor(np.zeros((2, 4, 4)))
_y, h = enc(src)
out, _ = dec(src, h)
print("out", out.shape[0], out.shape[1], out.shape[2])
```

### 句子留在下一页

编码器和解码器这一页只钉形状。真正的 16 对短句和四步更新写在序列到序列那一页。

延伸阅读：[编码器和解码器](https://zh.d2l.ai/chapter_recurrent-modern/encoder-decoder.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-modern/encoder-decoder.html)。

---
language: dl
chapter: 110
title: "风格损失"
level: intermediate
minutes: 8
goals:
  - "用三张噪声当内容、风格和画布"
  - "格拉姆矩阵按空间长度归一"
  - "四步只更新画布"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

风格这一页没有现成的深层网络。三张 32 乘 32 的噪声在代码里画出来。两层里实际只用一只冻住的卷积当特征。内容损失是特征差的平方，风格损失是格拉姆矩阵差的平方。画出来不会像书里的照片。

### 只让像素走四步

卷积权重标成不更新。优化器里只有画布这一张图。学习率 0.05。格拉姆矩阵先除以空间位置的个数，避免平方把损失撑爆。

```numpy run expect="loss" title="只让像素走四步"
# 噪声图上的风格损失
import minitorch as mt
import numpy as np
np.random.seed(0)
rng = np.random.RandomState(1)
img = mt.tensor(rng.rand(1, 1, 32, 32), requires_grad=True)
content = mt.tensor(rng.rand(1, 1, 32, 32))
style_img = mt.tensor(rng.rand(1, 1, 32, 32))
conv = mt.nn.Conv2d(1, 4, 3, padding=1)
for p in conv.parameters():
    p.requires_grad = False
opt = mt.optim.SGD([img], lr=0.05)

def gram(feat):
    flat = feat.reshape(feat.shape[1], -1)
    return (flat @ flat.transpose()) / flat.shape[1]

last = 0.0
for step in range(4):
    opt.zero_grad()
    fo = conv(img)
    fc = conv(content)
    fs = conv(style_img)
    content_loss = ((fo - fc) * (fo - fc)).mean()
    delta = gram(fo) - gram(fs)
    style_loss = (delta * delta).mean()
    loss = content_loss + style_loss
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 格拉姆矩阵的对角

四通道、边长 8 的全 1 特征，每个通道有 64 个 1。通道和自己的内积是 64，所以对角元是 64，矩阵边长是 4。

```numpy run expect="gram 4 64" title="格拉姆矩阵的对角"
# 全 1 特征的格拉姆矩阵
import minitorch as mt
import numpy as np
feat = mt.tensor(np.ones((1, 4, 8, 8)))
flat = feat.reshape(4, -1)
gram = flat @ flat.transpose()
print("gram", gram.shape[0], int(gram.data[0, 0]))
```

### 噪声不会变成照片

风格损失页的三张图都是均匀噪声，特征卷积也是随机的。四步之后像素会挪一点，但不会出现书里那种内容照片配风格画的效果。

延伸阅读：[风格损失](https://zh.d2l.ai/chapter_computer-vision/neural-style.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/neural-style.html)。

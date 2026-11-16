---
language: dl
chapter: 35
title: "自定义层"
level: beginner
minutes: 8
goals:
  - "子类化 Module"
  - "用一个标量缩放去中心化的输入"
  - "让这个标量出现在参数列表里"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

自定义层只要继承 Module 并写出 forward。下面这个层先减去均值，再乘以一个可训练的标量。输入是 1 和 3。

### 中心化再放大

均值是 2。偏差是 -1 和 1，乘以 2 之后是 -2 和 2。参数列表里只有这一个标量。

```numpy run expect="out -2.0 2.0" title="中心化再放大"
# 标量初值是 2
import minitorch as mt
class Center(mt.nn.Module):
    def __init__(self):
        self.scale = mt.tensor([2.0], requires_grad=True)
    def forward(self, x):
        return (x - x.mean()) * self.scale
layer = Center()
y = layer(mt.tensor([[1.0, 3.0]]))
print("out", float(y.data[0, 0]), float(y.data[0, 1]))
print("params", len(layer.parameters()))
```

### 标量的梯度

损失取输出的平方和。中心化之后的两个数平方和为 2，再乘以标量的平方，对标量求导得到 8。

```numpy run expect="grad 8.0" title="标量的梯度"
# 对平方和求导
import minitorch as mt
class Center(mt.nn.Module):
    def __init__(self):
        self.scale = mt.tensor([2.0], requires_grad=True)
    def forward(self, x):
        return (x - x.mean()) * self.scale
layer = Center()
y = layer(mt.tensor([[1.0, 3.0]]))
(y * y).sum().backward()
print("grad", float(layer.scale.grad.reshape(-1)[0]))
```

### 参数会被优化器看见

parameters 会走进子类的属性。只要标量是 Tensor 且 requires_grad 为真，SGD 就能更新它。

延伸阅读：[自定义层](https://zh.d2l.ai/chapter_deep-learning-computation/custom-layer.html)，英文页在[这里](https://d2l.ai/chapter_deep-learning-computation/custom-layer.html)。

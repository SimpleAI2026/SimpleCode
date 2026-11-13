---
language: dl
chapter: 27
title: "反向传播"
level: intermediate
minutes: 8
goals:
  - "画出平方的反向"
  - "读出乘积两项的梯度"
  - "先把图收成标量"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

两个小计算图都收成标量再反向。平方的梯度是输入的两倍。乘积加一项时，两个输入的梯度可以分别读出来。

### 平方的值和梯度

输入 3，平方是 9，梯度是 6。打印先写函数值，再写梯度。

```numpy run expect="9 6" title="平方图"
# 3 的平方是 9
import minitorch as mt
x = mt.tensor([3.0], requires_grad=True)
y = (x * x).sum()
y.backward()
print(int(y.item()), int(x.grad[0]))
```

### 乘积再加一项

a 是 2，b 是 4。y = a*b + a 的值是 10。对 a 的梯度是 b+1，也就是 5。对 b 的梯度是 a，也就是 2。

```numpy run expect="10 5 2" title="乘积图"
# 两个叶子都要梯度
import minitorch as mt
a = mt.tensor([2.0], requires_grad=True)
b = mt.tensor([4.0], requires_grad=True)
y = (a * b + a).sum()
y.backward()
print(int(y.item()), int(a.grad[0]), int(b.grad[0]))
```

### 图不会跨节保存

每次运行都新建张量。上一节的暂退掩码不会出现在这张图里。停止按钮会丢掉当前这次反向，但这一节的例子很小，一次就能走完。

延伸阅读：[反向传播](https://zh.d2l.ai/chapter_multilayer-perceptrons/backprop.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/backprop.html)。

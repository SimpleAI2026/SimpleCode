---
language: dl
chapter: 89
title: "学习率调度"
level: intermediate
minutes: 8
goals:
  - "每两步把学习率乘 0.5"
  - "四步后读到 0.05"
  - "单独复核这个倍率"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

优化器从学习率 0.2 开始。调度器每两步把学习率乘 0.5。四步更新之后，学习率应是 0.05，损失单独打印。

### 四步里的倍率

每一步先更新参数，再让调度器加一。第四次调用时，步数除以 2 的商是 2，0.2 乘上 0.5 的平方是 0.05。

```numpy run expect="lr 0.05" title="调度四步"
# 每两步乘 0.5
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.SGD([w], lr=0.2)
sched = mt.optim.StepLR(opt, step_size=2, gamma=0.5)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    sched.step()
    last = loss.item()
print("loss", round(last, 4), "lr", round(opt.lr, 4))
```

### 只算倍率

不建参数，直接把 0.2 乘上 0.5 的二次方。打印应和上一段结束时的学习率一致。

```numpy run expect="lr 0.05" title="倍率"
# 0.2 * 0.25
base = 0.2
gamma = 0.5
print("lr", round(base * (gamma ** (4 // 2)), 4))
```

### 调度不改优化器的种类

倍率包在 SGD 外面。换成 Adam 或动量时，同样可以在 step 之后调用这个调度器，只要那个对象暴露学习率。

延伸阅读：[学习率调度](https://zh.d2l.ai/chapter_optimization/lr-scheduler.html)，英文页在[这里](https://d2l.ai/chapter_optimization/lr-scheduler.html)。

---
language: dl
chapter: 80
title: "凸性"
level: intermediate
minutes: 8
goals:
  - "核对凸函数不等式"
  - "打印中点和平均"
  - "看三个点的平方"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

平方函数是凸的：中点的函数值不会大于两端函数值的平均。三个整数点的平方直接打印出来对照。

### 中点和平均

1 和 3 的中点是 2，平方是 4。两端平方的平均是 5。4 不大于 5，符合凸函数的不等式。

```numpy run expect="4.0 5.0" title="凸不等式"
# 4 对 5
def f(x):
    return x * x
mid = f(0.5 * 1.0 + 0.5 * 3.0)
avg = 0.5 * f(1.0) + 0.5 * f(3.0)
print(round(mid, 4), round(avg, 4))
```

### 三个点的平方

-1、0、1 的平方是 1、0、1。它们对称，用来看函数在 0 的两侧一起升高。

```numpy run expect="1 0 1" title="三个平方"
# 两侧对称
xs = [-1.0, 0.0, 1.0]
print(" ".join(str(int(x * x)) for x in xs))
```

### 凸不能代替四步更新

知道不等式成立，仍要选一个步长去挪参数。下一节用固定步长把一个数从 4 往 0 推四次。

延伸阅读：[凸性](https://zh.d2l.ai/chapter_optimization/convexity.html)，英文页在[这里](https://d2l.ai/chapter_optimization/convexity.html)。

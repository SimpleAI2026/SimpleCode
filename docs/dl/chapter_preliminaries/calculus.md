---
language: dl
chapter: 8
title: "微积分"
level: beginner
minutes: 8
goals:
  - "用差商估计斜率"
  - "核对平方函数在 3 处的导数"
  - "打印采样点而不是画图"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

平方函数在 3 附近的斜率可以用左右两点的差商代替。采样则直接打印几个平方值，不再画曲线。

### 用差商看斜率

步长取万分之一。左右两点的函数差除以两倍步长，得到的数四舍五入后应接近 6，因为平方函数在 3 处的导数是 6。

```numpy run expect="6.0" title="差商"
# 平方在 3 处的差商
def square(x):
    return x * x
x = 3.0
h = 1e-4
slope = (square(x + h) - square(x - h)) / (2 * h)
print(round(slope, 4))
```

### 打印三个采样点

0、1、2 的平方是 0、1、4。页面不加载绘图库，所以这些将要画出来的数直接出现在终端里。

```numpy run expect="0 1 4" title="采样点"
# 三个整数的平方
xs = [0.0, 1.0, 2.0]
print(" ".join(str(int(x * x)) for x in xs))
```

### 自动微分下一步再写

差商要人选定步长。下节让张量自己记下乘法的梯度，不再手写左右两点。

延伸阅读：[微积分](https://zh.d2l.ai/chapter_preliminaries/calculus.html)，英文页在[这里](https://d2l.ai/chapter_preliminaries/calculus.html)。

---
language: dl
chapter: 11
title: "查阅文档"
level: beginner
minutes: 8
goals:
  - "用 help 查看线性层"
  - "确认梯度下降带权重衰减"
  - "知道外部文档不会执行"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

帮助文本只覆盖这个页面已经放进工作线程的对象。线性层和带动量衰减项的随机梯度下降都能查到。外部神经网络库的文档不在这里。

### 查看线性层

帮助会列出类名和构造时的两个长度。页面上的线性层把输入维和输出维写进权重的形状，偏置长度等于输出维。

```numpy run expect="Linear" title="线性层帮助"
# 只看本页的线性层
import minitorch as mt
help(mt.nn.Linear)
```

### 查看梯度下降

随机梯度下降的构造参数里有学习率和权重衰减。衰减默认为 0。后面的权重衰减一节会把它设成正数。

```numpy run expect="weight_decay" title="梯度下降帮助"
# 帮助里应出现衰减参数
import minitorch as mt
help(mt.optim.SGD)
```

### 外部文档不执行

有的书会让读者去查另一套神经网络模块的网页。那个地址不在本页，下面这一段只保留说明，不会发起查询。

```numpy norun title="外部文档"
# 本页没有 torch.nn
print("torch.nn docs are not on this page")
```

延伸阅读：[查阅文档](https://zh.d2l.ai/chapter_preliminaries/lookup-api.html)，英文页在[这里](https://d2l.ai/chapter_preliminaries/lookup-api.html)。

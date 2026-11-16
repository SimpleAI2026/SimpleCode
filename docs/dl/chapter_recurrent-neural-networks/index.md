---
language: dl
chapter: 53
title: "循环神经网络"
level: beginner
minutes: 8
goals:
  - "知道这一组从序列走到文本"
  - "隐状态按时间往前传"
  - "四步只为看见 loss"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

这一组先看一条等差序列，再把一小段合成文本切成词，最后用隐状态走四步。文本不是整本书，隐层宽度停在 16。

### 先看数字，再读文本

开篇只打印一个标记。后面的序列节用固定数字，文本节才去读样本。

```numpy norun title="先看数字，再读文本"
# 章首不读文本
print("rnn-open")
```

### 隐层不放大

训练页把隐藏宽度写成 16，时间长度写成 4。这样四步在浏览器里只是一次很小的循环。

```numpy norun title="隐层不放大"
# 宽度写在后面
print("rnn-width-later")
```

### 准确率只是附带打印

语言模型会多印一次 acc。这一组是否跑通，看的是 loss 这几个字母，不把 acc 当成门槛。循环网络的开篇就停在这个约定上。

延伸阅读：[循环神经网络](https://zh.d2l.ai/chapter_recurrent-neural-networks/index.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-neural-networks/index.html)。

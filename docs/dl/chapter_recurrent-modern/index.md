---
language: dl
chapter: 61
title: "现代循环网络"
level: beginner
minutes: 8
goals:
  - "从门控单元看到双向"
  - "翻译样本只有 24 对"
  - "四步仍然只看 loss"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

这一组换上 GRU 和 LSTM，再叠两层、走双向，最后用 24 对短句看编码和解码。每句固定四个词。

### 门控在后面几页

开篇不计算门控。GRU 和 LSTM 各自用同一小段文本走四步。

```numpy norun title="门控在后面几页"
# 章首不算门
print("modern-open")
```

### 句子对很小

翻译样本是 16 对训练和 8 对检查，不是整份平行语料。序列到序列那一页会写明。

```numpy norun title="句子对很小"
# 二十四对
print("pairs-later")
```

### 打印约定不变

现代循环网络的训练页仍会多印 acc。是否通过只看 loss。这一组的开篇把这句话留在这里。

延伸阅读：[现代循环网络](https://zh.d2l.ai/chapter_recurrent-modern/index.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-modern/index.html)。

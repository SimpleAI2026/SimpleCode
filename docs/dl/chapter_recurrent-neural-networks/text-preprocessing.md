---
language: dl
chapter: 55
title: "文本预处理"
level: beginner
minutes: 8
goals:
  - "读出合成文本的词数"
  - "数出不重复的词"
  - "样本只有两千字节左右"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

预处理只做两件事：按空白切开，再丢掉句号。样本是生成器写的短句，用来代替一本长篇。

### 数词

全部小写之后按空白切开，句号不单独成词。打印出来的个数就是后面窗口的原料。

```numpy run expect="tokens 382" title="数词"
# 去掉句号
import minitorch as mt
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
print("tokens", len(words))
```

### 词表有多宽

同一批词放进集合再排序。宽度不大，所以后面的线性层可以直接对着它。

```numpy run expect="vocab 26" title="词表有多宽"
# 排序后的集合
import minitorch as mt
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
print("vocab", len(set(words)))
```

### 不下载整本书

磁盘上的文本大约两千字节，句子来自固定生成器。预处理这一页只报告 382 个词和 26 个词形。

延伸阅读：[文本预处理](https://zh.d2l.ai/chapter_recurrent-neural-networks/text-preprocessing.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-neural-networks/text-preprocessing.html)。

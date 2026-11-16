---
language: dl
chapter: 93
title: "没有第二块设备可分"
level: intermediate
minutes: 6
goals:
  - "知道只有一块 CPU 内存"
  - "批量不会切成两半"
  - "并行只留在标题里"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

自动并行是运行时自己把互不依赖的算子放到不同设备。这里只有一块 CPU 内存，调度没有第二条路。

### 损失和反向在同一条调用

损失要等前向写完才有数，反向要等损失写完才有梯度。两段都发生在同一次 Python 调用栈里。

```numpy norun title="损失和反向在同一条调用"
# 一条调用栈
print("par-chain")
```

### 四行不切开

一批四行不会切成两半送到两块芯片。形状在整次前向里保持作者写下来的那个样子。

```numpy norun title="四行不切开"
# 不拆批量
print("par-nosplit")
```

### 标题里的并行没有落地

自动并行这一页只说明缺的是第二块设备。它不假装矩阵乘已经被分出去。

延伸阅读：[没有第二块设备可分](https://zh.d2l.ai/chapter_computational-performance/auto-parallelism.html)，英文页在[这里](https://d2l.ai/chapter_computational-performance/auto-parallelism.html)。

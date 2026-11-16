---
language: dl
chapter: 94
title: "数组留在同一块内存"
level: intermediate
minutes: 6
goals:
  - "知道没有主机与设备两份缓冲"
  - "明白批量为四是为了时限"
  - "不读取硬件计数器"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

硬件叙述通常对比缓存、显存带宽和内核启动。这一页的张量是 WebAssembly 内存里的 NumPy 数组，没有第二块显存。

### 卷积也写在原地

不存在把数组从主机拷到设备再拷回来的步骤。im2col 展开的中间矩阵同样落在这一块内存。

```numpy norun title="卷积也写在原地"
# 一块内存
print("hw-one")
```

### 四行是为了冒烟时限

文档冒烟要在固定时间内看完一块围栏。训练页把批量定成四行，是为了让这一块内存上的乘法及时结束，不是因为测到了某条总线的带宽。

```numpy norun title="四行是为了冒烟时限"
# 时限不是带宽
print("hw-budget")
```

### 计数器不交给页面

缓存命中和显存吞吐需要硬件计数器。浏览器没有把那些计数器交给这一页，所以硬件这一节不报带宽。

延伸阅读：[数组留在同一块内存](https://zh.d2l.ai/chapter_computational-performance/hardware.html)，英文页在[这里](https://d2l.ai/chapter_computational-performance/hardware.html)。

---
language: dl
chapter: 90
title: "计算性能这一组"
level: intermediate
minutes: 6
goals:
  - "知道这八节只阅读"
  - "分清缺的是编译器和设备"
  - "开篇不放计时"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

计算性能这一组说明浏览器里为什么没有编译后的计算图，也没有第二块设备。八节都只阅读。开篇不测量耗时。

### 八节停在说明

数组库在 Python 调用返回前就把结果写好。它不把同一段网络收成一张可以再编译的图，也不把一批样本拆到两块芯片上。

```numpy norun title="八节停在说明"
# 开篇不记时
print("perf-open")
```

### 毫秒说明不了显卡

就算把一小段乘法标成可运行，打印出来的毫秒也只属于当前这个标签页。它不是显卡流水线的计数，所以这一组不放计时围栏。

```numpy norun title="毫秒说明不了显卡"
# 不放基准
print("perf-no-bench")
```

### 后面各管一件缺失

混合编程、异步队列、自动并行、硬件计数、两节多卡和参数服务器，各自指出缺哪一种机制。计算性能的开篇不替那七页做实验。

延伸阅读：[计算性能这一组](https://zh.d2l.ai/chapter_computational-performance/index.html)，英文页在[这里](https://d2l.ai/chapter_computational-performance/index.html)。

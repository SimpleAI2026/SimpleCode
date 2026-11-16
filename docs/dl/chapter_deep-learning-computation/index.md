---
language: dl
chapter: 31
title: "深度学习计算"
level: beginner
minutes: 6
goals:
  - "知道本组讲层、参数和存档"
  - "记住参数在构造时就存在"
  - "把 GPU 留在只读说明里"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

这一组把网络看成可以嵌套的块，并说明参数何时出现、如何被两层共用、怎样写进一个 npz。浏览器里的 Worker 没有 CUDA。

### 块和参数

后面几页分别构造嵌套的 Sequential、查看共享权重、手写一个带缩放的层，再把权重写进文件又读回来。

```numpy norun title="块和参数"
# 章首不建层
print("block-open")
```

### 这里不谈显卡

延后初始化在别的框架里要等第一次前向才分配权重。这份运行时做不到那一步，单独有一页说明。GPU 那一页不执行。

```numpy norun title="这里不谈显卡"
# 参数页在后面
print("params-later")
```

### 文件只在同一次运行里有效

npz 写在这次运行的内存文件系统里。换一节再打开，不保证文件还在。

延伸阅读：[深度学习计算](https://zh.d2l.ai/chapter_deep-learning-computation/index.html)，英文页在[这里](https://d2l.ai/chapter_deep-learning-computation/index.html)。

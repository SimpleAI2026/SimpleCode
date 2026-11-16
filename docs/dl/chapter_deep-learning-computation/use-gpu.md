---
language: dl
chapter: 37
title: "没有 GPU"
level: intermediate
minutes: 6
goals:
  - "知道 Worker 里没有 CUDA"
  - "卷积也在同一套 CPU 数组上算"
  - "这两段代码不执行"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

Pyodide 这一侧没有显卡设备，也没有把张量拷到另一块内存的 API。卷积、汇聚和线性层都用同一份 NumPy 数组。

### 没有设备可切换

代码里不会出现 cuda 或 to(device)。硬写这种调用只会得到属性错误，所以下面保持只读。

```numpy norun title="没有设备可切换"
# 没有 cuda 属性
print("no-gpu-here")
```

### 速度靠小批量

四步、一批四张、28 乘 28，是为了让 im2col 的矩阵留在浏览器能在几秒内乘完的尺寸。

```numpy norun title="速度靠小批量"
# 卷积留在 CPU
print("cpu-only-conv")
```

### 数值和设备无关

同一组权重在这份 CPU 实现上的互相关结果，就是后面几节用来对照的那些整数。

延伸阅读：[没有 GPU](https://zh.d2l.ai/chapter_deep-learning-computation/use-gpu.html)，英文页在[这里](https://d2l.ai/chapter_deep-learning-computation/use-gpu.html)。

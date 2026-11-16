---
language: numpy
chapter: 0
title: "NumPy 数组入门"
minutes: 8
goals:
  - "认出这份运行时带有 NumPy"
  - "用 array 做出一维数组"
  - "从标准输入读一个乘数"
sources:
  - numpy-manual
updated: "2026-10-20"
---

这一册讲数组，不重复语法入门。侧栏 NumPy 用 Pyodide 里的 CPython 3.14 加 NumPy，和旁边的 DeepLearning 共用 Worker 与缓存，并和 WASI 版 Python 分开。点 Run 只执行眼前这一段。

### 先做一个数组

np.array 接受普通列表，得到带形状的 ndarray。shape 的第 0 项是长度，sum 把元素加起来。

```numpy run expect="3 16" title="三个数"
import numpy as np
# 长度与总和
a = np.array([2, 5, 9])
print(a.shape[0], int(a.sum()))
```

终端里会打印 3 16。

### 标准输入仍可用

input 会停住，直到宿主把一行写进共享内存。这里读一个整数再乘四。围栏预先放了一行 3。

```numpy run expect="12" title="乘四" stdin="3\n"
n = int(input())
# 读入乘数
print(n * 4)
```

输出是 12。

### 和另一门 Python 分开

WASI 那份 CPython 没有装 NumPy，导入会失败。写数组示例时留在 NumPy 这一行。minitorch 写在共享的 Pyodide 文件系统里，DeepLearning 用的也是这一份。
### 第 11 章以后

通用函数、布尔索引、花式索引、排序查找、einsum、结构化数组和向量化接在副本这一章后面。计时会抖动，所以向量化一章只核对结果，不比速度。

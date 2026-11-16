---
language: dl
chapter: 91
title: "解释执行，不编译图"
level: intermediate
minutes: 6
goals:
  - "知道前向在调用时算完"
  - "分清没有符号图可导出"
  - "不比较编译前后的耗时"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

混合编程要把命令式调用收成一张稍后编译的图。这一页的线性层在调用发生时就算完，没有第二段编译。

### 调用当时就写出结果

nn.Linear 的前向在回到下一行 Python 之前已经得到矩阵乘积。没有一个开关把这层先记录、再交给另一个编译器。

```numpy norun title="调用当时就写出结果"
# 没有编译开关
print("hyb-eager")
```

### 梯度留在同一条链上

反向从损失沿着刚刚调用过的层往回走。不存在把网络导出成另一份可执行文件再加载的步骤。

```numpy norun title="梯度留在同一条链上"
# 不导出图
print("hyb-nograph")
```

### 没有第二列耗时

书上用编译前后两列耗时说明混合编程。这里没有编译器，第二列无从填写，所以解释执行这一页只阅读。

延伸阅读：[解释执行不编译图](https://zh.d2l.ai/chapter_computational-performance/hybridize.html)，英文页在[这里](https://d2l.ai/chapter_computational-performance/hybridize.html)。

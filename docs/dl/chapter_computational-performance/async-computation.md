---
language: dl
chapter: 92
title: "一次只完成一个 Run"
level: intermediate
minutes: 6
goals:
  - "知道没有 CUDA 流"
  - "知道停止会拆掉 Worker"
  - "终端顺序就是执行顺序"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

异步计算靠设备队列把内核先排上、稍后再同步。这个 Worker 一次只处理一个 Run，输出在这次算完之后才回到终端。

### 没有第二条队列

不存在把两个卷积放进两条设备流的接口。下一次前向要等上一次反向从 Python 返回。

```numpy norun title="没有第二条队列"
# 没有设备流
print("async-one")
```

### 停止不留排队内核

按下停止时，宿主结束这个 Worker。不会剩下一条已经发射、还没同步的内核在后台写数组。

```numpy norun title="停止不留排队内核"
# 停止即结束
print("async-stop")
```

### 先打印的就是先算完的

终端里先出现的损失来自先结束的那一步。异步计算这一页没有「先发射、后同步」造成的错位。

延伸阅读：[一次只完成一个 Run](https://zh.d2l.ai/chapter_computational-performance/async-computation.html)，英文页在[这里](https://d2l.ai/chapter_computational-performance/async-computation.html)。

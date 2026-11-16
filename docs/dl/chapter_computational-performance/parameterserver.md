---
language: dl
chapter: 97
title: "参数不出这一个页面"
level: intermediate
minutes: 6
goals:
  - "权重写在虚拟文件系统"
  - "没有拉取参数的客户端"
  - "多机同步不在此实现"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

参数服务器把权重放在一组机器上，工作节点拉取再推回梯度。这个 Worker 不打开网络，也没有第二台机器。

### npz 停在虚拟盘

save_npz 把数组写进本机的虚拟文件系统。没有把同一组参数推到另一台主机的通道。

```numpy norun title="npz 停在虚拟盘"
# 不推到别的主机
print("ps-local")
```

### 没有工作节点进程

不存在定时拉取权重的客户端，也没有把多份梯度加总的服务进程。参数服务器这一页只有当前这个标签。

```numpy norun title="没有工作节点进程"
# 没有服务进程
print("ps-noworker")
```

### 陈旧梯度不在讨论范围

多机同步、陈旧梯度和节点掉线都不在参数服务器这一页实现。那些题目留在原书的延伸阅读里。

延伸阅读：[参数不出这一个页面](https://zh.d2l.ai/chapter_computational-performance/parameterserver.html)，英文页在[这里](https://d2l.ai/chapter_computational-performance/parameterserver.html)。

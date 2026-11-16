---
language: dl
chapter: 135
title: "没有云主机可开"
level: intermediate
minutes: 6
goals:
  - "侧栏下载的不是系统镜像"
  - "页面没有 SSH"
  - "不报价也不开机"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

云主机一节讲选择镜像、打开实例、再用 SSH 连进去。这个练习场没有实例控制接口，也没有 SSH。

### 下载的是运行时

侧栏下载的是 Pyodide 和几份小样本，不是一块云硬盘上的系统镜像。云主机这一页没有实例列表。

```numpy norun title="下载的是运行时"
# 没有系统镜像
print("ec2-none")
```

### 没有二十二端口

页面通过本机的开发服务器打开。没有 22 端口，也没有密钥对可以配。

```numpy norun title="没有二十二端口"
# 没有密钥对
print("ec2-nossh")
```

### 单价留在原书

实例单价和区域选择变化很快。云主机这一页不报价，也不帮读者开机。

延伸阅读：[没有云主机可开](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/aws.html)，英文页在[这里](https://d2l.ai/chapter_appendix-tools-for-deep-learning/aws.html)。

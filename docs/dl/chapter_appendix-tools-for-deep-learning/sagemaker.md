---
language: dl
chapter: 134
title: "没有云上训练作业"
level: intermediate
minutes: 6
goals:
  - "页面不保存访问密钥"
  - "没有作业编号可查"
  - "日志只在本页终端"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

SageMaker 把训练提交成云上的作业，数据放在对象存储里。这个 Worker 不能创建作业，也不能读云上的桶。

### 没有密钥入口

页面不保存访问密钥，也不弹出云账号登录。训练读的是已经放在同源目录里的小文件。

```numpy norun title="没有密钥入口"
# 不登录云账号
print("sm-local")
```

### 没有作业编号

没有训练作业编号，也就没有「排队、运行中、已完成」这种远端状态可以刷新。

```numpy norun title="没有作业编号"
# 没有远端状态
print("sm-noid")
```

### 损失打在本页

云上作业这一页的损失如果出现，只会出现在本页终端。没有把日志汇到控制台的通道。

延伸阅读：[没有云上训练作业](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/sagemaker.html)，英文页在[这里](https://d2l.ai/chapter_appendix-tools-for-deep-learning/sagemaker.html)。

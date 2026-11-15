---
language: dl
chapter: 4
title: "预备知识"
level: beginner
minutes: 6
goals:
  - "知道这一组先讲工具"
  - "分清只读目录和可运行节"
  - "把参数更新留到后面"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

这一组把后面模型会用到的数组、表格、矩阵、导数和抽样先分开写。优化器和网络结构留在更后面的目录里。

### 先看哪些工具

数组负责存格子，表格负责补缺，矩阵负责乘法和长度，导数负责说明参数该往哪边挪。概率这一节只用块里新建的随机数发生器。

### 这里不更新参数

章首没有损失函数，也没有四步更新。下面两段标成只读，避免读者把目录页当成一次训练。

```numpy norun title="章首跳过"
# 章首不训练
print('prelim-open')
```

### 查阅也先搁下

帮助文本只能描述已经放进这个页面的对象。查外部框架文档的那段同样不执行，原因是页面里没有那套文档。

```numpy norun title="外部文档"
# 不查询外部文档
print('no-external-docs')
```

延伸阅读：[预备知识](https://zh.d2l.ai/chapter_preliminaries/index.html)，英文页在[这里](https://d2l.ai/chapter_preliminaries/index.html)。

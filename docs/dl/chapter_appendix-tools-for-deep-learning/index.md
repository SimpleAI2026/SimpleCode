---
language: dl
chapter: 132
title: "附录这一组"
level: intermediate
minutes: 6
goals:
  - "知道工具在页面外面"
  - "名字对照单独成页"
  - "开篇不安装云服务"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

附录收笔记本、云上作业、云主机、选机器和上游库的名字。这些都不是 Worker 里能启动的程序。

### 内核和账号都在外面

Jupyter 要内核，SageMaker 和 EC2 要账号。附录开篇只解释它们为什么进不了这个标签页。

```numpy norun title="内核和账号都在外面"
# 附录不开机
print("appx-open")
```

### 对照表是这里写的

最后一节把常见层名对到 minitorch 的类。那张表是本仓库写的，不是从上游手册剪下来的。

```numpy norun title="对照表是这里写的"
# 不剪上游手册
print("appx-map")
```

### 开篇不负责安装

附录开篇不执行 pip，也不申请任何云上的配额。安装和开机都留在各自那一页的说明里。

延伸阅读：[附录这一组](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/index.html)，英文页在[这里](https://d2l.ai/chapter_appendix-tools-for-deep-learning/index.html)。

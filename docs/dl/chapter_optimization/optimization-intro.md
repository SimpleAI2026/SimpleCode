---
language: dl
chapter: 79
title: "优化和深度学习"
level: intermediate
minutes: 6
goals:
  - "分清损失和任务名字"
  - "接受四步这个长度"
  - "知道更新在本页的对象上"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

训练是在有限步里把一个标量损失往下推，不是证明全局最小。这一页只讲这个差别，不创建参数。

### 损失和目标

回归的目标可以是一条直线的系数，分类的目标可以是十个分数。优化器只看见损失对当前参数的梯度，看不见任务的名字。

### 四步是教学长度

更长的循环会把文档冒烟拖过时限，也看不出这套页面和完整训练的差别。所以每节停在第四步，并打印 loss。

```numpy norun title="四步"
# 停在第四步
print('four-steps-only')
```

### 没有第二个框架

这些更新都写在本页的优化器对象上。不另装一套带自动微分的外部库，也不从网络拉取实现。

```numpy norun title="不装第二套"
# 不装外部优化库
print('no-second-framework')
```

延伸阅读：[优化和深度学习](https://zh.d2l.ai/chapter_optimization/optimization-intro.html)，英文页在[这里](https://d2l.ai/chapter_optimization/optimization-intro.html)。

---
language: dl
chapter: 136
title: "这一页不挑选显卡"
level: intermediate
minutes: 6
goals:
  - "运行时体积已经定死"
  - "批量来自时限而不是显存"
  - "不写采购清单"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

挑选服务器通常要比较显存、互联和预算。这一页的计算发生在打开它的那个浏览器标签里，没有机器清单。

### 侧栏仍是那一份

侧栏显示的是同一份 Pyodide，大约 15.8 MB。换一台带显卡的电脑并不会换成另一份运行时。

```numpy norun title="侧栏仍是那一份"
# 体积已定
print("pick-fixed")
```

### 四行不是显存刚好

训练节用四步、一批四行，是为了让文档冒烟在固定时间内结束。这个形状不是因为某张卡的显存刚好放下。

```numpy norun title="四行不是显存刚好"
# 时限决定批量
print("pick-time")
```

### 型号不写进正文

具体型号和报价依赖读者自己的机房，而且变得很快。挑选显卡这一页不列采购清单。

延伸阅读：[这一页不挑选显卡](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/selecting-servers-gpus.html)，英文页在[这里](https://d2l.ai/chapter_appendix-tools-for-deep-learning/selecting-servers-gpus.html)。

---
language: dl
chapter: 133
title: "这一页不是笔记本"
level: intermediate
minutes: 6
goals:
  - "一次 Run 送整段脚本"
  - "图改成打印数字"
  - "章节仍是 Markdown"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Jupyter 用内核执行单元格，并把图留在单元格下面。这一页是编辑器加终端，没有单元格编号，也没有内核协议。

### Run 送出整段文本

按下 Run 时，编辑器里的整段文本进入同一个 Worker。没有「只执行光标所在单元格」这种分割。

```numpy norun title="Run 送出整段文本"
# 没有单元格
print("nb-whole")
```

### 曲线变成数字

书上用绘图库把损失画成曲线。这里把那几个数打印在终端里，页面不嵌图片。

```numpy norun title="曲线变成数字"
# 终端不嵌图片
print("nb-print")
```

### ipynb 不是一章

渲染器不把笔记本文件当成章节。笔记本这一页说明文档仍是 Markdown，单元格格式不进抽屉。

延伸阅读：[这一页不是笔记本](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/jupyter.html)，英文页在[这里](https://d2l.ai/chapter_appendix-tools-for-deep-learning/jupyter.html)。

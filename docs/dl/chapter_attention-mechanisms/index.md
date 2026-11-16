---
language: dl
chapter: 70
title: "注意力机制"
level: beginner
minutes: 8
goals:
  - "从加权平均走到多头"
  - "图留在延伸阅读"
  - "训练页仍然只走四步"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

这一组先用一维的核加权，再写评分函数、加性注意力和多头。示意图不画在页面里，训练宽度会写明。

### 概念先于公式

开篇不计算权重。下一页用一句查询说明注意力在挑哪些位置。

```numpy norun title="概念先于公式"
# 章首不算权重
print("attn-open")
```

### 矩阵都很小

评分和多头两页用的边长不超过 8。Transformer 那一页把宽度写成 16，并只留一块。

```numpy norun title="矩阵都很小"
# 宽度写在后面
print("attn-width-later")
```

### 延伸阅读里才有图

注意力这组不嵌示意图。开篇只约定：能跑的页打印 loss，不能跑的页保持只读。

延伸阅读：[注意力机制](https://zh.d2l.ai/chapter_attention-mechanisms/index.html)，英文页在[这里](https://d2l.ai/chapter_attention-mechanisms/index.html)。

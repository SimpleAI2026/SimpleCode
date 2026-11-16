---
language: dl
chapter: 71
title: "注意力提示"
level: beginner
minutes: 8
goals:
  - "把查询、键和值分开"
  - "不在这一页画图"
  - "权重留到下一页再算"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

注意力用查询去比较一组键，再按比较结果把值加起来。这一页只把三个角色说清楚，不计算数字。

### 查询在找什么

查询是当前想对齐的向量。键是每个位置用来被比较的向量。两者的接近程度决定权重。

```numpy norun title="查询在找什么"
# 只命名角色
print("query-role")
```

### 值才被加起来

权重乘在值上，不乘回键。所以键负责打分，值负责被取出来。

```numpy norun title="值才被加起来"
# 键和值分开
print("value-role")
```

### 数字在下一页

注意力提示不打印权重。核回归那一页才用五个点算出一个加权结果。

延伸阅读：[注意力提示](https://zh.d2l.ai/chapter_attention-mechanisms/attention-cues.html)，英文页在[这里](https://d2l.ai/chapter_attention-mechanisms/attention-cues.html)。

---
language: dl
chapter: 69
title: "束搜索"
level: beginner
minutes: 8
goals:
  - "用固定分数而不是网络"
  - "束宽保持为 2"
  - "三步之后打印最佳路径"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

束搜索在每一步只留下分数最高的几条路径。这一页的分数是写死的 3 乘 3 矩阵，束宽是 2。

### 留下两条路径

每一步把旧路径加上新词的对数分数，排序后只留前两名。

```numpy run expect="beam 1 0 2" title="留下两条路径"
# 束宽 2
import numpy as np
scores = np.array([
    [0.1, 0.6, 0.3],
    [0.5, 0.2, 0.3],
    [0.2, 0.2, 0.6],
])
beam = [(0.0, [])]
for row in scores:
    nxt = []
    for total, path in beam:
        for token, score in enumerate(row):
            nxt.append((total + float(np.log(score)), path + [int(token)]))
    nxt.sort(key=lambda item: item[0], reverse=True)
    beam = nxt[:2]
best = beam[0][1]
print("beam", best[0], best[1], best[2])
```

### 最佳分数是负数

对数分数都是负数。打印四舍五入后的总分，用来核对排序没有拿反。

```numpy run expect="score -1.7148" title="最佳分数是负数"
# 对数分
import numpy as np
scores = np.array([
    [0.1, 0.6, 0.3],
    [0.5, 0.2, 0.3],
    [0.2, 0.2, 0.6],
])
beam = [(0.0, [])]
for row in scores:
    nxt = []
    for total, path in beam:
        for token, score in enumerate(row):
            nxt.append((total + float(np.log(score)), path + [int(token)]))
    nxt.sort(key=lambda item: item[0], reverse=True)
    beam = nxt[:2]
print("score", round(beam[0][0], 4))
```

### 不需要已经训好的模型

束搜索这一页的路径来自那张固定分数表。它不读取 16 对句子，也不更新权重。

延伸阅读：[束搜索](https://zh.d2l.ai/chapter_recurrent-modern/beam-search.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-modern/beam-search.html)。

---
language: dl
chapter: 95
title: "没有多卡梯度求和"
level: intermediate
minutes: 6
goals:
  - "知道梯度只来自当前这批"
  - "参数只有一份"
  - "卡数恒为一"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

多卡训练要把各卡梯度加总再写回同一组参数。这一页没有第二张卡，也没有集合通信。

### 梯度只来自这四行

SGD 用的是当前四行算出来的梯度。没有另一批梯度从别的卡送过来相加。

```numpy norun title="梯度只来自这四行"
# 没有集合通信
print("gpu-none")
```

### 参数不复制

优化器持有的是模块上的那些张量。不存在按卡复制一份、再把平均结果广播回去的第二组权重。

```numpy norun title="参数不复制"
# 一份权重
print("gpu-one-copy")
```

### 横轴上没有卡数

吞吐对卡数的曲线需要至少两个点。多卡求和这一页的卡数恒为一，横轴画不出来。

延伸阅读：[没有多卡梯度求和](https://zh.d2l.ai/chapter_computational-performance/multiple-gpus.html)，英文页在[这里](https://d2l.ai/chapter_computational-performance/multiple-gpus.html)。

---
language: dl
chapter: 96
title: "没有多卡包装器"
level: intermediate
minutes: 6
goals:
  - "模块按写下的顺序调用"
  - "切片仍由训练页自己做"
  - "构造函数不收设备号"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

简洁的多卡实现通常用包装器把同一模块复制到一张设备清单上。这张清单在这里是空的，包装器没有出现。

### 顺序模块就是普通对象

nn.Sequential 里的层按写下来的顺序调用。没有「复制到设备」这种方法，也没有设备清单参数。

```numpy norun title="顺序模块就是普通对象"
# 没有设备清单
print("wrap-plain")
```

### 四行由页面自己切

训练页用下标取出四行。没有一个加载器把一个更大的批分给多张卡。

```numpy norun title="四行由页面自己切"
# 没有多卡加载器
print("wrap-slice")
```

### SGD 不接收设备编号

可运行的训练页直接构造模块和 SGD。多卡包装器这一页确认这些构造函数不接收设备编号。

延伸阅读：[没有多卡包装器](https://zh.d2l.ai/chapter_computational-performance/multiple-gpus-concise.html)，英文页在[这里](https://d2l.ai/chapter_computational-performance/multiple-gpus-concise.html)。

---
language: dl
chapter: 6
title: "数据预处理"
level: beginner
minutes: 8
goals:
  - "用标准库读八行"
  - "用平均数补空房间"
  - "计算已有价格的平均"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

八行小表直接写在代码里，大约几十个字符，不再另存文件，也不安装表格库。空着的房间数用已有房间数的平均数补上，空着的价格不参与平均。

### 补上缺失的房间数

八行里只有一格房间数是空的。先收集写了数字的房间，求出平均，再写回那一格。行数仍是 8，补上的格子数是 1。

```numpy run expect="rows 8 filled 1" title="补缺失"
# 八行里有一格空房间
import csv
import io
raw = "area,rooms,price\n50,2,10\n60,,12\n40,1,8\n70,3,\n80,2,16\n55,2,11\n45,1,9\n65,3,14\n"
rows = list(csv.DictReader(io.StringIO(raw)))
rooms = [float(row["rooms"]) for row in rows if row["rooms"]]
fill = sum(rooms) / len(rooms)
filled = 0
for row in rows:
    if not row["rooms"]:
        row["rooms"] = str(round(fill, 2))
        filled += 1
print("rows", len(rows), "filled", filled)
```

### 价格平均跳过空值

有一行价格没写。平均只加那七个已有价格，再除以 7。面积列这一节不用，留着是为了让表和后面的房价例子一样有多列。

```numpy run expect="price 11.43" title="价格平均"
# 七个价格求平均
import csv
import io
raw = "area,rooms,price\n50,2,10\n60,,12\n40,1,8\n70,3,\n80,2,16\n55,2,11\n45,1,9\n65,3,14\n"
rows = list(csv.DictReader(io.StringIO(raw)))
prices = [float(row["price"]) for row in rows if row["price"]]
print("price", round(sum(prices) / len(prices), 2))
```

### 不把整库读进来

竞赛用的房价原表有上千行。这一节的八行只演示缺值怎么补，不代表那份原表，也不把原表放进页面下载。

延伸阅读：[数据预处理](https://zh.d2l.ai/chapter_preliminaries/pandas.html)，英文页在[这里](https://d2l.ai/chapter_preliminaries/pandas.html)。

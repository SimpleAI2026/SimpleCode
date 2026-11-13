---
language: dl
chapter: 6
title: "Data preparation"
level: beginner
minutes: 8
goals:
  - "Read eight rows with the standard library"
  - "Fill a blank room with the mean"
  - "Average the prices that exist"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Eight short rows live in the block, a few dozen characters and no extra file. No table library is installed. A blank room count is filled from the mean of the known counts, and a blank price is left out of the average.

### Fill the missing room count

One room cell among the eight rows is blank. The block averages the room counts that are present and writes that average back. The row count stays 8 and the filled count is 1.

```numpy run expect="rows 8 filled 1" title="Fill a gap"
# One blank room cell in eight rows
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

### Average price skips the blank

One price is missing. The average adds the seven prices that exist and divides by 7. The area column is unused here. It stays so the tiny table still has several columns, like the later price example.

```numpy run expect="price 11.43" title="Price average"
# Average of seven prices
import csv
import io
raw = "area,rooms,price\n50,2,10\n60,,12\n40,1,8\n70,3,\n80,2,16\n55,2,11\n45,1,9\n65,3,14\n"
rows = list(csv.DictReader(io.StringIO(raw)))
prices = [float(row["price"]) for row in rows if row["price"]]
print("price", round(sum(prices) / len(prices), 2))
```

### Do not load a full table

A contest price table has thousands of rows. These eight rows only show how a gap is filled. They are not that contest file, and the page does not download it.

Pages: [zh](https://zh.d2l.ai/chapter_preliminaries/pandas.html) and [en](https://d2l.ai/chapter_preliminaries/pandas.html).

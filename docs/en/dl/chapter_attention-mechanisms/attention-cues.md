---
language: dl
chapter: 71
title: "Attention cues"
level: beginner
minutes: 8
goals:
  - "Separate query, key, and value"
  - "Do not draw a figure here"
  - "Leave the weights for the next page"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Attention compares a query with a set of keys, then adds the values with those comparison results. This page only names the three roles and does not compute a number.

### What the query is looking for

The query is the vector that wants to line up. A key is the vector each position offers for comparison. Their closeness decides the weight.

```numpy norun title="What the query is looking for"
# Only the roles are named
print("query-role")
```

### Only the values are added

The weights multiply the values, not the keys. Keys are for scoring, and values are what get retrieved.

```numpy norun title="Only the values are added"
# Keys and values stay apart
print("value-role")
```

### The numbers are on the next page

Attention cues do not print a weight. The kernel page is the one that turns five points into one weighted result.

Pages: [zh](https://zh.d2l.ai/chapter_attention-mechanisms/attention-cues.html) and [en](https://d2l.ai/chapter_attention-mechanisms/attention-cues.html).

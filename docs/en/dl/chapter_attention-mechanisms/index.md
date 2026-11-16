---
language: dl
chapter: 70
title: "Attention"
level: beginner
minutes: 8
goals:
  - "Go from a weighted average to several heads"
  - "Leave figures in further reading"
  - "Keep training pages at four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

This group starts with a one-dimensional kernel average, then scoring, additive attention, and several heads. Diagrams are not drawn on the page, and a training width is stated where it is reduced.

### The idea comes before the formula

The opener does not compute weights. The next page uses one query to show which positions attention picks.

```numpy norun title="The idea comes before the formula"
# The opener does not compute weights
print("attn-open")
```

### The matrices stay small

The scoring page and the multi-head page keep edges at or below 8. The transformer page sets the width to 16 and keeps a single block.

```numpy norun title="The matrices stay small"
# The width is stated later
print("attn-width-later")
```

### Figures stay in further reading

This attention group does not embed diagrams. The opener only agrees that a runnable page prints loss and a read-only page stays read-only.

Pages: [zh](https://zh.d2l.ai/chapter_attention-mechanisms/index.html) and [en](https://d2l.ai/chapter_attention-mechanisms/index.html).

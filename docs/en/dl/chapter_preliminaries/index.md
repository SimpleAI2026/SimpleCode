---
language: dl
chapter: 4
title: "Preliminaries"
level: beginner
minutes: 6
goals:
  - "Name the tools in this group"
  - "Tell a contents page from a runnable section"
  - "Leave parameter updates for later"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

This group separates arrays, tables, matrices, derivatives, and sampling before any network is trained. Optimizers and architectures come later in the contents.

### Tools named here

Arrays hold the cells, tables fill gaps, matrices multiply and measure length, and derivatives say which way a parameter should move. The probability section builds a fresh generator inside the block.

### No parameter update yet

The chapter opener has no loss and no four-step update. The next two blocks stay read-only so this contents page is not mistaken for a training run.

```numpy norun title="Skip the opener"
# The opener does not train
print('prelim-open')
```

### Lookup waits one section

Help text can describe only objects that already live on this page. The note about an outside framework stays unread because those docs are not installed.

```numpy norun title="Outside manual"
# Do not query an outside manual
print('no-external-docs')
```

Pages: [zh](https://zh.d2l.ai/chapter_preliminaries/index.html) and [en](https://d2l.ai/chapter_preliminaries/index.html).

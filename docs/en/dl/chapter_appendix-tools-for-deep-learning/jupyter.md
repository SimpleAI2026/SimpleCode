---
language: dl
chapter: 133
title: "This page is not a notebook"
level: intermediate
minutes: 6
goals:
  - "Send the whole script on Run"
  - "Print numbers instead of a figure"
  - "Keep chapters as Markdown"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Jupyter runs cells in a kernel and leaves figures under the cells. This page is an editor plus a terminal. It has no cell numbers and no kernel protocol.

### Run sends the whole buffer

Run sends the whole editor buffer into one worker. There is no split that executes only the cell around the cursor.

```numpy norun title="Run sends the whole buffer"
# No cells
print("nb-whole")
```

### A curve becomes numbers

A published page would plot the loss. Here those numbers are printed in the terminal. The page embeds no picture.

```numpy norun title="A curve becomes numbers"
# The terminal embeds no picture
print("nb-print")
```

### An ipynb is not a chapter

The renderer does not treat a notebook file as a chapter. The notebook page records that docs stay Markdown and cell files stay out of the drawer.

Pages: [zh](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/jupyter.html) and [en](https://d2l.ai/chapter_appendix-tools-for-deep-learning/jupyter.html).

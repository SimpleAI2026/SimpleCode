---
language: dl
chapter: 1
title: "Installation"
level: beginner
minutes: 6
goals:
  - "See that the runtime is already in the sidebar"
  - "Leave install commands in read-only blocks"
  - "Remember that later data stays tiny"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

This page says what the playground already has. There is no second deep-learning setup to configure, and a code block must not call out to an install host.

### The runtime is already in the sidebar

After this row is selected, the array library and the teaching package minitorch are prepared by the page. Later runnable examples use a numpy fence so they enter this worker, rather than the other interpreter that only runs ordinary scripts.

### Install commands stay read-only

Creating an environment, installing a GPU driver, and pulling a framework with a package manager belong on another machine. This page has none of those tools, and it has no GPU. The commands are written for comparison. The run button does not appear.

```numpy norun title="Package manager does not run"
# pip install torch
print("skip-pip")
```

One more environment command is kept beside it, and it does not run either.

```numpy norun title="Environment tool does not run"
# conda install pytorch
print("skip-conda")
```

### Later data is a small slice

A training section will read a small sample placed in the same origin at build time. Counts stay in the tens, and an optimizer takes four steps. This chapter adds no new file. A function that downloads a full archive must not appear in a runnable block.

Further reading for installation: the [Chinese section](https://zh.d2l.ai/chapter_installation/index.html) and the [English section](https://d2l.ai/chapter_installation/index.html) of Dive into Deep Learning.

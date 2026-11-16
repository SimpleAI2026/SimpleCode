---
language: dl
chapter: 132
title: "Appendix, in outline"
level: intermediate
minutes: 6
goals:
  - "Keep the tools outside the page"
  - "Give the name map its own page"
  - "Install no cloud service from the opener"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The appendix collects notebooks, cloud jobs, cloud machines, machine choice, and upstream library names. None of those is a program this worker can start.

### Kernels and accounts stay outside

Jupyter wants a kernel. SageMaker and EC2 want accounts. The appendix opener only explains why they cannot enter this tab.

```numpy norun title="Kernels and accounts stay outside"
# The appendix starts no machine
print("appx-open")
```

### The map is written here

The last section pairs common layer names with minitorch classes. That table is written in this repository. It is not clipped from an upstream manual.

```numpy norun title="The map is written here"
# No clip from a manual
print("appx-map")
```

### The opener installs nothing

The appendix opener runs no pip command and requests no cloud quota. Install and power-on stay in the explanations on their own pages.

Pages: [zh](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/index.html) and [en](https://d2l.ai/chapter_appendix-tools-for-deep-learning/index.html).

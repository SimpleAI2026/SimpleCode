---
language: dl
chapter: 0
title: "Preface"
minutes: 6
goals:
  - "See that this book follows a public table of contents"
  - "Keep further reading separate from the page text"
  - "Recognize a read-only block that does not run"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The DeepLearning notes in the sidebar are rearranged from this page onward, following a public table of contents. The full list has one hundred thirty-nine sections. After the four openers, preliminaries, linear models, multilayer perceptrons, and optimization are written. Sentences, strings, and comments are new.

### How the contents are ordered

The renderer numbers each section from the table of contents, not from the spelling of the file name. The preface is chapter 0. Installation, notation, and the introduction follow as chapters 1, 2, and 3. Convolution, sequences, and the appendix stay on that table until a later phase, instead of keeping a second short course beside them.

### Where the sentences come from

The explanation does not paste paragraphs from the published book, and it does not swap a few words in those sentences. Each chapter ends with one line that links to the Chinese page and the English page for that section. Those links are further reading. This directory does not carry a share-alike license or a notice file.

### This page does not run

The preface has no training loop and no install command that the browser should execute. The next two blocks are read-only. They mark the boundary: the numeric library is already on the page, and weight updates belong later.

```numpy norun title="Preface does not install"
# The runtime is already on this page.
print("preface-skip")
```

The second block also stays unread. It does not mean this chapter changes any parameter.

```numpy norun title="Preface does not update"
# Parameter updates stay in a later chapter.
print("no-step")
```

Further reading for the preface: the [Chinese section](https://zh.d2l.ai/chapter_preface/index.html) and the [English section](https://d2l.ai/chapter_preface/index.html) of Dive into Deep Learning.

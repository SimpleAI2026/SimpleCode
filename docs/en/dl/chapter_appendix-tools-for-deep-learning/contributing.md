---
language: dl
chapter: 137
title: "Changes go through a repository pull request"
level: intermediate
minutes: 6
goals:
  - "Keep one file per language"
  - "Leave read-only pages unread"
  - "Write new sentences"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The upstream book has its own notebook contribution path. This volume's text is Markdown in the repository. Changes go through a pull request, not a patch typed into the browser.

### One section, two files

Chinese and English for one section are two files. The program inside a fence matches, and the comments follow the language.

```numpy norun title="One section, two files"
# The program matches
print("contrib-pair")
```

### Read-only stays unread

Performance and the appendix are marked read-only. A print added so the block looks runnable would record a device feature that is not implemented.

```numpy norun title="Read-only stays unread"
# Do not pretend a device exists
print("contrib-ro")
```

### New paragraphs are written here

Sentences added to the drawer are newly written. A link may point at the book. The book's sentences are not pasted. The contribution page follows that rule too.

Pages: [zh](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/contributing.html) and [en](https://d2l.ai/chapter_appendix-tools-for-deep-learning/contributing.html).

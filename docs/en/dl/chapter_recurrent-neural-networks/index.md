---
language: dl
chapter: 53
title: "Recurrent networks"
level: beginner
minutes: 8
goals:
  - "See the path from a sequence to text"
  - "Carry a hidden state forward in time"
  - "Use four steps only to see a loss"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

This group starts with an arithmetic sequence, then cuts a short synthetic text into words, and finally walks a hidden state for four steps. The text is not a whole book, and the hidden width stays at 16.

### Numbers first, then text

The opener only prints a marker. The sequence section uses fixed numbers, and the text section is the one that reads the sample.

```numpy norun title="Numbers first, then text"
# The opener does not read text
print("rnn-open")
```

### The hidden width stays small

Training pages set the hidden width to 16 and the time length to 4, so four steps stay a small loop in the browser.

```numpy norun title="The hidden width stays small"
# The width is stated later
print("rnn-width-later")
```

### Accuracy is only an extra print

A language model also prints acc. A passing run looks for the letters in loss, and acc is not a threshold. The recurrent opener stops on that agreement.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-neural-networks/index.html) and [en](https://d2l.ai/chapter_recurrent-neural-networks/index.html).

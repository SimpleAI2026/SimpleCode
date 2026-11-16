---
language: dl
chapter: 125
title: "Twelve short reviews"
level: intermediate
minutes: 8
goals:
  - "Keep eight for training and four for a check"
  - "Truncate to six words"
  - "Split the labels evenly"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The sentiment data is twelve handwritten English reviews, not a movie-review archive. Eight are for training and four are for a check. Training has four positive and four negative lines. A sentence longer than six words is truncated.

### How many lines are positive

Training has 8 lines and the check split has 4. The training labels sum to 4 and the check labels sum to 2. Label 1 is positive.

```numpy run expect="reviews 8 4 4 2" title="How many lines are positive"
# review counts
import minitorch as mt
import numpy as np
texts, labels, held, held_y = mt.sentiment_reviews()
print("reviews", len(texts), len(held), int(labels.sum()), int(held_y.sum()))
```

### The clip length is 6

The later recurrent net and the convolution both look at the first six words, and missing positions are filled with 0. This snippet only prints that length.

```numpy run expect="clip 6" title="The clip length is 6"
# truncation length
import minitorch as mt
import numpy as np
print("clip", 6)
```

### Twelve lines are not a review archive

The sentences on the sentiment-data page were written so the two labels are even. There is no star rating and none of the tens-of-megabytes source. The next page splits the eight lines into two batches and alternates them.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-and-dataset.html) and [en](https://d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-and-dataset.html).

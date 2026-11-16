---
language: dl
chapter: 124
title: "Applications, in outline"
level: intermediate
minutes: 8
goals:
  - "Keep reviews apart from sentence pairs"
  - "Keep four steps as the cap"
  - "Do not run a model in the opener"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The applications group uses twelve short reviews and twelve sentence pairs. The recurrent net, the convolution, and the narrow encoder all start from random weights. The opener does not train.

### Two kinds of data

A review is positive or negative. A sentence pair is entailment, contradiction, or neutral. Neither side reads an outside corpus archive.

```numpy norun title="Two kinds of data"
# opener does not train
import minitorch as mt
import numpy as np
print("apply-open")
```

### Random weights

The application pages do not load the encoder from the earlier four steps as a finished model. The fine-tuning page initializes its own narrow encoder.

```numpy norun title="Random weights"
# weights are initialized again
import minitorch as mt
import numpy as np
print("apply-random")
```

### The opener only names the later pages

The applications opener does not score a review and does not run attention over a sentence pair. Those sit on the pages that take four steps.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-applications/index.html) and [en](https://d2l.ai/chapter_natural-language-processing-applications/index.html).

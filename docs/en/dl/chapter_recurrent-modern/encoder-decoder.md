---
language: dl
chapter: 67
title: "Encoder and decoder"
level: beginner
minutes: 8
goals:
  - "Start the decoder from the encoder's last state"
  - "Use batch 2 and time 4"
  - "Skip the sentences on this page"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

An encoder folds a whole input into one hidden state, and the decoder continues from that state. This page pins the interface shapes with a zero tensor.

### The shape of the last state

Two inputs of length 4 and width 4 use a hidden width of 4. The last state is 2 by 4 and has no time axis.

```numpy run expect="state 2 4" title="The shape of the last state"
# Keep only the last state
import minitorch as mt
import numpy as np
np.random.seed(0)
enc = mt.nn.RNN(4, 4)
src = mt.tensor(np.zeros((2, 4, 4)))
_y, h = enc(src)
print("state", h.shape[0], h.shape[1])
```

### The decoder continues

Hand that state to another RNN and the output becomes 2 by 4 by 4, with time restored.

```numpy run expect="out 2 4 4" title="The decoder continues"
# Pass the state to the decoder
import minitorch as mt
import numpy as np
np.random.seed(0)
enc = mt.nn.RNN(4, 4)
dec = mt.nn.RNN(4, 4)
src = mt.tensor(np.zeros((2, 4, 4)))
_y, h = enc(src)
out, _ = dec(src, h)
print("out", out.shape[0], out.shape[1], out.shape[2])
```

### The sentences wait for the next page

This encoder-decoder page only pins shapes. The real 16 short pairs and the four-step update are written on the sequence-to-sequence page.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-modern/encoder-decoder.html) and [en](https://d2l.ai/chapter_recurrent-modern/encoder-decoder.html).

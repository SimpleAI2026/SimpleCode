---
language: dl
chapter: 26
title: "Dropout"
level: intermediate
minutes: 8
goals:
  - "Drop units with a given mask"
  - "Scale kept units while training"
  - "Return the input unchanged during evaluation"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The mask comes from a generator inside the block. The seed is fixed so the print does not change between runs. In training, kept positions are multiplied by 1 over 0.5. In evaluation the input is returned unchanged.

### Use the mask while training

Among four positions, a mask value of 1 is scaled by two. The block prints how many positions were kept and the sum of the outputs. That sum should equal the kept count times 2.

```numpy run expect="kept" title="Train mask"
# Mask from seed 0
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
mask = (rng.random((1, 4)) >= 0.5).astype(np.float64)
layer = mt.nn.Dropout(0.5)
layer.train()
out = layer(mt.tensor([[1.0, 1.0, 1.0, 1.0]]), mask)
print("kept", int(mask.sum()), "sum", round(float(out.sum().item()), 1))
```

### Ignore the mask during evaluation

After the training flag is off, a mask of all zeros still leaves the sum of 1, 2, and 3 equal to 6. Evaluation does not drop units.

```numpy run expect="eval 6.0" title="Eval mode"
# A zero mask should not change the sum
import numpy as np
import minitorch as mt
layer = mt.nn.Dropout(0.5)
layer.eval()
out = layer(mt.tensor([[1.0, 2.0, 3.0]]), np.zeros((1, 3)))
print("eval", round(float(out.sum().item()), 1))
```

### Do not draw the mask from a global stream

If the mask came from a global stream that survives across runs, the expected string would not match. The mask is built in the block, and the generator has a seed.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/dropout.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/dropout.html).

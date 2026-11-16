---
language: dl
chapter: 36
title: "Save parameters as npz"
level: beginner
minutes: 8
goals:
  - "Write a weight into an npz"
  - "Clear the in-memory numbers and read them back"
  - "Confirm the loaded matrix matches"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

Inside one run, parameters can be written to an npz under /data and read back. That is not a contract between sections. After a section change the file may be gone.

### Write, wipe, and load

The block records the initial weight, saves it, sets the in-memory weight to 0, then fills it from the file. It prints 1 when allclose is true.

```numpy run expect="match 1" title="Write, wipe, and load"
# Write and read in the same run
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Linear(2, 1)
before = layer.weight.data.copy()
mt.save_npz("/data/sc-params.npz", {"w": layer.weight, "b": layer.bias})
layer.weight.data[:] = 0
loaded = mt.load_npz("/data/sc-params.npz")
layer.weight.data[:] = loaded["w"]
print("match", int(np.allclose(layer.weight.data, before)))
```

### The bias is in the file too

Dictionary keys are the names passed at the call. The bias entry has length 1, matching the linear layer output width.

```numpy run expect="bias 1" title="The bias is in the file too"
# Store only the bias
import minitorch as mt
import numpy as np
np.random.seed(1)
layer = mt.nn.Linear(2, 1)
mt.save_npz("/data/sc-bias.npz", {"b": layer.bias})
loaded = mt.load_npz("/data/sc-bias.npz")
print("bias", int(loaded["b"].shape[0]))
```

### Do not rely on the next open

The worker filesystem lives in the memory of this page session. After a refresh, or after switching runtime, the npz should not be assumed to remain.

Pages: [zh](https://zh.d2l.ai/chapter_deep-learning-computation/read-write.html) and [en](https://d2l.ai/chapter_deep-learning-computation/read-write.html).

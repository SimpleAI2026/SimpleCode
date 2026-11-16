---
language: dl
chapter: 100
title: "Fine-tuning"
level: intermediate
minutes: 8
goals:
  - "Use eight synthetic gray images"
  - "Freeze the first convolution"
  - "Take one check after four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

This fine-tuning page has no pretrained weights. Eight gray 32 by 32 images split into four for training and four for a check, with two labels. The first convolution stays random and frozen. Only the linear layer steps.

### The same batch repeats four times

Training has four images, so all four steps feed that same batch. The step size is 0.05. Accuracy on the check split is meaningless. It is printed only to show that one evaluation ran.

```numpy run expect="loss" title="The same batch repeats four times"
# freeze the first layer, then four steps
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, vx, vy = mt.finetune_images()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(4 * 16 * 16, 2),
)
net.layers[0].weight.requires_grad = False
net.layers[0].bias.requires_grad = False
opt = mt.optim.SGD(net.parameters(), lr=0.05)
xb = mt.tensor(x.astype(np.float64) / 255.0)
last = 0.0
for step in range(4):
    opt.zero_grad()
    loss = mt.cross_entropy(net(xb), y)
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(net(mt.tensor(vx.astype(np.float64) / 255.0)), vy)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### Width after the pool

An edge of 32 becomes 16 after a pool of stride 2. Four channels flatten to 1024 numbers, and the linear layer emits two scores.

```numpy run expect="shape 4 1024" title="Width after the pool"
# shape on four blank images
import minitorch as mt
import numpy as np
np.random.seed(0)
blank = mt.tensor(np.zeros((4, 1, 32, 32)))
tower = mt.nn.Sequential(
    mt.nn.Conv2d(1, 4, 3, padding=1),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
)
flat = tower(blank)
print("shape", flat.shape[0], flat.shape[1])
```

### A frozen layer is left out of the update

Once the convolution weight and bias are marked as not needing a gradient, the optimizer's parameter list leaves them out. This is not continued training from an image-net checkpoint. It is a random feature extractor plus a small head.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/fine-tuning.html) and [en](https://d2l.ai/chapter_computer-vision/fine-tuning.html).

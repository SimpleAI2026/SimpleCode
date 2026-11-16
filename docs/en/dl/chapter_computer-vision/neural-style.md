---
language: dl
chapter: 110
title: "A style loss"
level: intermediate
minutes: 8
goals:
  - "Use three noise images as content, style, and canvas"
  - "Normalize the Gram matrix by the spatial length"
  - "Update only the canvas for four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The style page has no pretrained deep network. Three 32 by 32 noise images are drawn in the snippet. Of the two layers people often stack, this page keeps one frozen convolution as the feature. Content loss is the squared feature gap, and style loss is the squared gap of Gram matrices. The canvas will not look like the photograph in the book.

### Only the pixels take four steps

The convolution weights are marked as not updating. The optimizer holds only the canvas. The step size is 0.05. The Gram matrix is divided by the number of spatial positions so the square does not blow the loss up.

```numpy run expect="loss" title="Only the pixels take four steps"
# style loss on noise
import minitorch as mt
import numpy as np
np.random.seed(0)
rng = np.random.RandomState(1)
img = mt.tensor(rng.rand(1, 1, 32, 32), requires_grad=True)
content = mt.tensor(rng.rand(1, 1, 32, 32))
style_img = mt.tensor(rng.rand(1, 1, 32, 32))
conv = mt.nn.Conv2d(1, 4, 3, padding=1)
for p in conv.parameters():
    p.requires_grad = False
opt = mt.optim.SGD([img], lr=0.05)

def gram(feat):
    flat = feat.reshape(feat.shape[1], -1)
    return (flat @ flat.transpose()) / flat.shape[1]

last = 0.0
for step in range(4):
    opt.zero_grad()
    fo = conv(img)
    fc = conv(content)
    fs = conv(style_img)
    content_loss = ((fo - fc) * (fo - fc)).mean()
    delta = gram(fo) - gram(fs)
    style_loss = (delta * delta).mean()
    loss = content_loss + style_loss
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### The diagonal of a Gram matrix

A feature of four channels and edge 8, filled with ones, has 64 ones in each channel. The dot product of a channel with itself is 64, so a diagonal entry is 64 and the matrix edge is 4.

```numpy run expect="gram 4 64" title="The diagonal of a Gram matrix"
# Gram matrix of an all-ones feature
import minitorch as mt
import numpy as np
feat = mt.tensor(np.ones((1, 4, 8, 8)))
flat = feat.reshape(4, -1)
gram = flat @ flat.transpose()
print("gram", gram.shape[0], int(gram.data[0, 0]))
```

### Noise does not become a photograph

All three pictures on the style-loss page are uniform noise, and the feature convolution is random too. After four steps the pixels move a little. They do not turn into the book's content photo painted in another style.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/neural-style.html) and [en](https://d2l.ai/chapter_computer-vision/neural-style.html).

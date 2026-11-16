---
language: dl
chapter: 112
title: "A smaller stand-in for two breeds"
level: intermediate
minutes: 8
goals:
  - "List ten names split by breed folders"
  - "Train on eight images and two labels"
  - "Alternate two batches across four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The breed page also lays out folder names first: a training folder and a check folder, each with two breed folders. What enters the network is eight training images and two check images, three channels, edge 32, and only two labels. The breed archive is not downloaded.

### Two batches take turns

Eight images split into two batches of four. Across four steps each batch is used twice. Average pooling shrinks the edge to 16. The two check images run once.

```numpy run expect="loss" title="Two batches take turns"
# four steps on two labels
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, vx, vy = mt.dog_images()
net = mt.nn.Sequential(
    mt.nn.Conv2d(3, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(4 * 16 * 16, 2),
)
opt = mt.optim.SGD(net.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    loss = mt.cross_entropy(
        net(mt.tensor(x[start:start + 4].astype(np.float64) / 255.0)),
        y[start:start + 4],
    )
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(net(mt.tensor(vx.astype(np.float64) / 255.0)), vy)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### Names of the breed folders

Eight training names and two check names make ten. The first is in train/b0 and the last is in val/b1. The strings are not stored on disk.

```numpy run expect="files 10 train/b0/img0.bin val/b1/img1.bin" title="Names of the breed folders"
# folder names for two breeds
import minitorch as mt
import numpy as np
names = []
i = 0
while i < 8:
    names.append("train/b" + str(i % 2) + "/img" + str(i) + ".bin")
    i += 1
i = 0
while i < 2:
    names.append("val/b" + str(i % 2) + "/img" + str(i) + ".bin")
    i += 1
print("files", len(names), names[0], names[-1])
```

### Two breeds are not the full list

The smaller breed page keeps only labels 0 and 1, which is enough to show folders and then four training steps. It does not recognize the long breed list and it does not read outside weights.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/kaggle-dog.html) and [en](https://d2l.ai/chapter_computer-vision/kaggle-dog.html).

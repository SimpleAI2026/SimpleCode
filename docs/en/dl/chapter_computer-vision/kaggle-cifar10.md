---
language: dl
chapter: 111
title: "A smaller stand-in for ten classes"
level: intermediate
minutes: 8
goals:
  - "List 20 file names in a folder layout"
  - "Keep only four labels in the tensors"
  - "Take four steps on sixteen training images"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The contest page lays out file names under a training folder and a check folder, one folder per class. What actually enters the network is 16 training images and 4 check images in memory, three channels, edge 32, with the labels cut down to four classes. The small zip is not downloaded.

### Four steps on four classes

Each step takes four images, so four steps use the 16 training images once and do not repeat them. The four check images are evaluated once. Accuracy is not a gate.

```numpy run expect="loss" title="Four steps on four classes"
# four steps on the four-class stand-in
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, vx, vy = mt.cifar_images()
net = mt.nn.Sequential(
    mt.nn.Conv2d(3, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(4 * 16 * 16, 4),
)
opt = mt.optim.SGD(net.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch_x = x[step * 4:(step + 1) * 4]
    batch_y = y[step * 4:(step + 1) * 4]
    loss = mt.cross_entropy(net(mt.tensor(batch_x.astype(np.float64) / 255.0)), batch_y)
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(net(mt.tensor(vx.astype(np.float64) / 255.0)), vy)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### The folder names are only strings

Sixteen training names and four check names make 20. The first lands in train/c0 and the last lands in val/c3. Those paths are not written to disk.

```numpy run expect="files 20 train/c0/img0.bin val/c3/img3.bin" title="The folder names are only strings"
# names in the folder layout
import minitorch as mt
import numpy as np
names = []
i = 0
while i < 16:
    names.append("train/c" + str(i % 4) + "/img" + str(i) + ".bin")
    i += 1
i = 0
while i < 4:
    names.append("val/c" + str(i % 4) + "/img" + str(i) + ".bin")
    i += 1
print("files", len(names), names[0], names[-1])
```

### Four classes are not the contest's ten

The smaller stand-in keeps labels in 0 through 3, with 3 channels still. It is there to walk the folder description and four training steps. It does not submit a contest entry.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/kaggle-cifar10.html) and [en](https://d2l.ai/chapter_computer-vision/kaggle-cifar10.html).

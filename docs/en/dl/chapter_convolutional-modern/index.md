---
language: dl
chapter: 45
title: "Modern convolutional networks"
level: intermediate
minutes: 6
goals:
  - "Know this group keeps 28 by 28"
  - "Channels and kernels are smaller than the original"
  - "Each section still takes four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

AlexNet, VGG, NiN, GoogLeNet, ResNet, and DenseNet each take four steps on these 32 images. The original structures expect an edge of 224. Here the image is not enlarged, and each page states the channel and kernel cuts.

### The layer kinds stay

Convolution, ReLU, pooling, flatten, and linear layers all remain. What changes is the channel count, the kernel edge, and how many times they are stacked.

```numpy norun title="The layer kinds stay"
# The opener does not train
print("modern-open")
```

### Batch normalization has its own page

That page first runs the formula on a 2 by 2 matrix, then inserts the same layer into LeNet for four steps.

```numpy norun title="Batch normalization has its own page"
# Channels are cut on each page
print("channels-cut")
```

### Loss is still what gets printed

The first runnable block of each section ends by printing loss. The shape block only checks four rows and ten columns, not whether the class is correct.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-modern/index.html) and [en](https://d2l.ai/chapter_convolutional-modern/index.html).

---
language: dl
chapter: 16
title: "Softmax regression"
level: beginner
minutes: 8
goals:
  - "Turn one row of scores into probabilities"
  - "Check that the probabilities add to 1"
  - "Compute cross-entropy on two rows"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Three scores subtract their maximum, pass through an exponential, and divide by their total. The three probabilities add to 1. Cross-entropy looks at how small the probability of the correct class is.

### The probabilities add to 1

The input is one row of three scores. The first probability and the sum of the three are both kept to four decimals. The sum should print as 1. There is no training loop.

```numpy run expect="1.0" title="Probability sum"
# Subtract the max, then normalize
import minitorch as mt
logits = mt.tensor([[2.0, 1.0, 0.1]])
prob = mt.softmax(logits)
print(round(float(prob[0].sum()), 4), round(float(prob[0, 0]), 4))
```

### Cross-entropy of two rows

The correct class of the first row is 0 and of the second row is 2. The loss is the mean of the two negative log probabilities and is printed with the word loss.

```numpy run expect="loss" title="Cross-entropy"
# Labels are 0 and 2
import minitorch as mt
logits = mt.tensor([[2.0, 1.0, 0.1], [0.2, 0.2, 2.0]])
loss = mt.cross_entropy(logits, [0, 2])
print("loss", round(loss.item(), 4))
```

### The image section attaches scores to pixels

The scores here are written-in decimals. The next runnable image section multiplies 784 pixels by a weight to get 10 scores, then uses this same cross-entropy.

Pages: [zh](https://zh.d2l.ai/chapter_linear-networks/softmax-regression.html) and [en](https://d2l.ai/chapter_linear-networks/softmax-regression.html).

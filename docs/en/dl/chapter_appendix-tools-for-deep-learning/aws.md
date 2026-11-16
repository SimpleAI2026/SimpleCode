---
language: dl
chapter: 135
title: "No cloud machine to start"
level: intermediate
minutes: 6
goals:
  - "See that the sidebar is not a disk image"
  - "See that the page has no SSH"
  - "Quote no price and start no instance"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A cloud-machine chapter chooses an image, starts an instance, and connects with SSH. This playground has no instance control and no SSH.

### The download is the runtime

The sidebar downloads Pyodide and a few small samples, not a system image on a cloud disk. The cloud-machine page has no instance list.

```numpy norun title="The download is the runtime"
# No system image
print("ec2-none")
```

### There is no port 22

The page opens through the local development server. There is no port 22 and no key pair to attach.

```numpy norun title="There is no port 22"
# No key pair
print("ec2-nossh")
```

### Prices stay in the book

Instance prices and regions change quickly. The cloud-machine page quotes nothing and starts nothing for the reader.

Pages: [zh](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/aws.html) and [en](https://d2l.ai/chapter_appendix-tools-for-deep-learning/aws.html).

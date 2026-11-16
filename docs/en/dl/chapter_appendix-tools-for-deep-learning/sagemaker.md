---
language: dl
chapter: 134
title: "No cloud training job"
level: intermediate
minutes: 6
goals:
  - "Store no access key"
  - "Offer no job id to query"
  - "Keep logs in this terminal"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

SageMaker would submit training as a cloud job and keep data in object storage. This worker cannot create a job and cannot read a cloud bucket.

### There is no key field

The page stores no access key and shows no cloud login. Training reads the small files already served from the same origin.

```numpy norun title="There is no key field"
# No cloud login
print("sm-local")
```

### There is no job id

Without a training-job id there is no remote state such as queued, running, or finished to refresh.

```numpy norun title="There is no job id"
# No remote status
print("sm-noid")
```

### The loss prints here

If a loss appears for the cloud-job page, it appears in this terminal. No channel aggregates logs into a console.

Pages: [zh](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/sagemaker.html) and [en](https://d2l.ai/chapter_appendix-tools-for-deep-learning/sagemaker.html).

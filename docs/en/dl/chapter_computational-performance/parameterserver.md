---
language: dl
chapter: 97
title: "Parameters stay on this page"
level: intermediate
minutes: 6
goals:
  - "Store weights on the virtual filesystem"
  - "Omit a parameter-pulling client"
  - "Leave multi-machine sync unimplemented"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A parameter server would keep weights on a set of machines, and workers would pull them and push gradients. This worker opens no network and has no second machine.

### An npz file stays on the virtual disk

save_npz writes arrays into the local virtual filesystem. No channel pushes that same set to another host.

```numpy norun title="An npz file stays on the virtual disk"
# No push to another host
print("ps-local")
```

### There is no worker process

No client pulls weights on a timer, and no service adds gradients from several processes. The parameter-server page is only the current tab.

```numpy norun title="There is no worker process"
# No service process
print("ps-noworker")
```

### Stale gradients are out of scope

Multi-machine sync, stale gradients, and dropped nodes are not implemented on the parameter-server page. Those topics stay in the further reading.

Pages: [zh](https://zh.d2l.ai/chapter_computational-performance/parameterserver.html) and [en](https://d2l.ai/chapter_computational-performance/parameterserver.html).

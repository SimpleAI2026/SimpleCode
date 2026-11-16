---
language: dl
chapter: 137
title: "改动走仓库的拉取请求"
level: intermediate
minutes: 6
goals:
  - "中英各一份文件"
  - "只读节不改成可运行"
  - "句子仍要新写"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

上游书有自己的笔记本贡献方式。这一册的正文是仓库里的 Markdown，改动走拉取请求，不在浏览器里交补丁。

### 同一节两个文件

同一节的中文和英文是两个文件。围栏里的程序要一致，注释按语言分开写。

```numpy norun title="同一节两个文件"
# 程序一致
print("contrib-pair")
```

### 只读不改成可运行

计算性能和附录标的是只读。为了看起来能跑而塞进一段打印，会把这一档写成已经实现的设备功能。

```numpy norun title="只读不改成可运行"
# 不假装有设备
print("contrib-ro")
```

### 新段落要自己写

补进抽屉的句子要新写。链接可以指向原书，原书的句子不贴进来。贡献这一页自己也遵守这一点。

延伸阅读：[改动走仓库的拉取请求](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/contributing.html)，英文页在[这里](https://d2l.ai/chapter_appendix-tools-for-deep-learning/contributing.html)。

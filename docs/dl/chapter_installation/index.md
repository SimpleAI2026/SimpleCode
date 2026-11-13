---
language: dl
chapter: 1
title: "安装"
level: beginner
minutes: 6
goals:
  - "知道运行时已经随侧栏备好"
  - "把安装命令留在只读块里"
  - "记得后文只用小样本"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

这一页说明练习场里已经有什么。不需要再配一套深度学习环境，也不要在代码块里访问安装源。

### 运行时已经在侧栏

选中这一行之后，数组库和教学用的 minitorch 由页面自己准备。以后可运行的例子使用 numpy 围栏，从而进这个 Worker，而不会误走另一套只能跑普通脚本的解释器。

### 安装命令留在只读块里

创建环境、安装显卡驱动和用包管理器拉取框架，都属于另一台机器。这里没有那些命令，也没有显卡。写出来是为了对照，运行按钮不会出现。

```numpy norun title="不执行包管理器"
# pip install torch
print("skip-pip")
```

再留一条常见的环境命令，同样不执行。

```numpy norun title="不执行环境工具"
# conda install pytorch
print("skip-conda")
```

### 数据以后只用一小份

带训练的节会读构建时放进同源目录的小样本。张数以几十为上限，优化只走四步。这一章不附带新文件。会去远端拉取整包数据的函数不能写进可运行块。

延伸阅读：安装在《动手学深度学习》的[这一节](https://zh.d2l.ai/chapter_installation/index.html)，英文原书的[同一节](https://d2l.ai/chapter_installation/index.html)。

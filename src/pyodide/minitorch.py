# Tiny NumPy autograd with a PyTorch-like surface.
# Original teaching code for SimpleCode. MIT License.
import struct

import numpy as np


def _as_tensor(value):
    if isinstance(value, Tensor):
        return value
    return Tensor(value)


def _acc(grad, extra):
    extra = np.asarray(extra, dtype=np.float64)
    if grad is None:
        return extra.copy()
    grad += extra
    return grad


def _unbroadcast(grad, shape):
    grad = np.asarray(grad, dtype=np.float64)
    while grad.ndim > len(shape):
        grad = grad.sum(axis=0)
    for axis, size in enumerate(shape):
        if size == 1 and grad.shape[axis] != 1:
            grad = grad.sum(axis=axis, keepdims=True)
    return grad


class Tensor:
    def __init__(self, data, requires_grad=False, _prev=(), _backward=None):
        self.data = np.asarray(data, dtype=np.float64)
        self.requires_grad = bool(requires_grad)
        self.grad = None
        self._prev = tuple(_prev)
        self._backward = _backward or (lambda: None)

    def item(self):
        return float(self.data.reshape(-1)[0])

    def backward(self):
        if self.data.size != 1:
            raise RuntimeError("backward expects a scalar")
        order = []
        seen = set()

        def visit(node):
            if id(node) in seen:
                return
            seen.add(id(node))
            for parent in node._prev:
                visit(parent)
            order.append(node)

        visit(self)
        self.grad = np.ones_like(self.data)
        for node in reversed(order):
            node._backward()

    def __add__(self, other):
        other = _as_tensor(other)
        out = Tensor(self.data + other.data, self.requires_grad or other.requires_grad, (self, other))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, _unbroadcast(out.grad, self.data.shape))
            if other.requires_grad:
                other.grad = _acc(other.grad, _unbroadcast(out.grad, other.data.shape))

        out._backward = backward
        return out

    def __radd__(self, other):
        return self.__add__(other)

    def __neg__(self):
        out = Tensor(-self.data, self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, -out.grad)

        out._backward = backward
        return out

    def __sub__(self, other):
        return self.__add__(-_as_tensor(other))

    def __rsub__(self, other):
        return _as_tensor(other).__sub__(self)

    def __mul__(self, other):
        other = _as_tensor(other)
        out = Tensor(self.data * other.data, self.requires_grad or other.requires_grad, (self, other))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, _unbroadcast(out.grad * other.data, self.data.shape))
            if other.requires_grad:
                other.grad = _acc(other.grad, _unbroadcast(out.grad * self.data, other.data.shape))

        out._backward = backward
        return out

    def __rmul__(self, other):
        return self.__mul__(other)

    def __truediv__(self, other):
        other = _as_tensor(other)
        out = Tensor(self.data / other.data, self.requires_grad or other.requires_grad, (self, other))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, _unbroadcast(out.grad / other.data, self.data.shape))
            if other.requires_grad:
                other.grad = _acc(other.grad, _unbroadcast(-out.grad * self.data / (other.data * other.data), other.data.shape))

        out._backward = backward
        return out

    def __rtruediv__(self, other):
        return _as_tensor(other).__truediv__(self)

    def __matmul__(self, other):
        other = _as_tensor(other)
        out = Tensor(self.data @ other.data, self.requires_grad or other.requires_grad, (self, other))

        def backward():
            if self.requires_grad:
                grad = out.grad @ np.swapaxes(other.data, -1, -2)
                self.grad = _acc(self.grad, _unbroadcast(grad, self.data.shape))
            if other.requires_grad:
                grad = np.swapaxes(self.data, -1, -2) @ out.grad
                other.grad = _acc(other.grad, _unbroadcast(grad, other.data.shape))

        out._backward = backward
        return out

    def sum(self, axis=None, keepdims=False):
        out = Tensor(self.data.sum(axis=axis, keepdims=keepdims), self.requires_grad, (self,))

        def backward():
            if not self.requires_grad:
                return
            grad = out.grad
            if axis is not None and not keepdims:
                grad = np.expand_dims(grad, axis)
            self.grad = _acc(self.grad, np.broadcast_to(grad, self.data.shape))

        out._backward = backward
        return out

    def mean(self, axis=None, keepdims=False):
        if axis is None:
            denom = self.data.size
        elif isinstance(axis, tuple):
            denom = 1
            for item in axis:
                denom *= self.data.shape[item]
        else:
            denom = self.data.shape[axis]
        return self.sum(axis=axis, keepdims=keepdims) * (1.0 / denom)

    def relu(self):
        mask = self.data > 0
        out = Tensor(np.where(mask, self.data, 0.0), self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, out.grad * mask)

        out._backward = backward
        return out

    def reshape(self, *shape):
        if len(shape) == 1 and isinstance(shape[0], (tuple, list)):
            shape = tuple(shape[0])
        out = Tensor(self.data.reshape(shape), self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, out.grad.reshape(self.data.shape))

        out._backward = backward
        return out

    def transpose(self):
        axes = list(range(self.data.ndim))
        axes[-1], axes[-2] = axes[-2], axes[-1]
        out = Tensor(self.data.transpose(axes), self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, out.grad.transpose(axes))

        out._backward = backward
        return out

    @property
    def T(self):
        return self.transpose()

    @property
    def shape(self):
        return self.data.shape

    def __getitem__(self, key):
        out = Tensor(self.data[key], self.requires_grad, (self,))

        def backward():
            if not self.requires_grad:
                return
            grad = np.zeros_like(self.data)
            np.add.at(grad, key, out.grad)
            self.grad = _acc(self.grad, grad)

        out._backward = backward
        return out

    def exp(self):
        out = Tensor(np.exp(self.data), self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, out.grad * out.data)

        out._backward = backward
        return out

    def log(self):
        out = Tensor(np.log(self.data), self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, out.grad / self.data)

        out._backward = backward
        return out

    def sigmoid(self):
        pos = self.data >= 0
        out_data = np.empty_like(self.data)
        out_data[pos] = 1.0 / (1.0 + np.exp(-self.data[pos]))
        neg = np.exp(self.data[~pos])
        out_data[~pos] = neg / (1.0 + neg)
        out = Tensor(out_data, self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, out.grad * out.data * (1.0 - out.data))

        out._backward = backward
        return out

    def tanh(self):
        value = np.tanh(self.data)
        out = Tensor(value, self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, out.grad * (1.0 - value * value))

        out._backward = backward
        return out

    def sqrt(self):
        value = np.sqrt(self.data)
        out = Tensor(value, self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, out.grad * (0.5 / value))

        out._backward = backward
        return out

    def permute(self, *axes):
        if len(axes) == 1 and isinstance(axes[0], (tuple, list)):
            axes = tuple(axes[0])
        axes = tuple(int(axis) for axis in axes)
        out = Tensor(np.transpose(self.data, axes), self.requires_grad, (self,))

        def backward():
            if self.requires_grad:
                inverse = np.argsort(axes)
                self.grad = _acc(self.grad, np.transpose(out.grad, inverse))

        out._backward = backward
        return out


def tensor(data, requires_grad=False):
    return Tensor(data, requires_grad=requires_grad)


def zeros(*shape, requires_grad=False):
    return Tensor(np.zeros(shape), requires_grad=requires_grad)


def cross_entropy(logits, targets):
    labels = np.asarray(targets if not isinstance(targets, Tensor) else targets.data, dtype=np.int64).reshape(-1)
    shifted = logits.data - logits.data.max(axis=1, keepdims=True)
    exp = np.exp(shifted)
    probs = exp / exp.sum(axis=1, keepdims=True)
    rows = np.arange(labels.shape[0])
    picked = np.clip(probs[rows, labels], 1e-12, 1.0)
    out = Tensor(-np.log(picked).mean(), logits.requires_grad, (logits,))

    def backward():
        if not logits.requires_grad:
            return
        grad = probs.copy()
        grad[rows, labels] -= 1.0
        grad /= labels.shape[0]
        logits.grad = _acc(logits.grad, grad * float(out.grad.reshape(-1)[0]))

    out._backward = backward
    return out


def softmax(logits):
    data = logits.data if isinstance(logits, Tensor) else np.asarray(logits, dtype=np.float64)
    shifted = data - data.max(axis=-1, keepdims=True)
    exp = np.exp(shifted)
    return exp / exp.sum(axis=-1, keepdims=True)


class Module:
    def parameters(self):
        found = []
        seen = set()

        def walk(obj):
            if id(obj) in seen:
                return
            seen.add(id(obj))
            if isinstance(obj, Tensor):
                if obj.requires_grad:
                    found.append(obj)
                return
            if not isinstance(obj, Module):
                return
            for value in vars(obj).values():
                if isinstance(value, (list, tuple)):
                    for item in value:
                        walk(item)
                else:
                    walk(value)

        walk(self)
        return found

    def zero_grad(self):
        for param in self.parameters():
            param.grad = None

    def train(self, mode=True):
        self.training = bool(mode)
        for value in vars(self).values():
            if isinstance(value, Module):
                value.train(mode)
            elif isinstance(value, (list, tuple)):
                for item in value:
                    if isinstance(item, Module):
                        item.train(mode)
        return self

    def eval(self):
        return self.train(False)

    def __call__(self, *args, **kwargs):
        return self.forward(*args, **kwargs)

    def forward(self, *args, **kwargs):
        raise NotImplementedError


class Linear(Module):
    def __init__(self, in_features, out_features):
        limit = 1.0 / np.sqrt(in_features)
        self.weight = Tensor(np.random.uniform(-limit, limit, (out_features, in_features)), requires_grad=True)
        self.bias = Tensor(np.zeros(out_features), requires_grad=True)

    def forward(self, x):
        return x @ self.weight.transpose() + self.bias


class ReLU(Module):
    def forward(self, x):
        return x.relu()


class Dropout(Module):
    """Inverted dropout. Pass a 0/1 mask, or a seed so Sequential can draw one per forward."""

    def __init__(self, p=0.5, seed=None):
        self.p = float(p)
        self.seed = None if seed is None else int(seed)
        self._rng = None if seed is None else np.random.default_rng(int(seed))

    def forward(self, x, mask=None):
        x = _as_tensor(x)
        if not getattr(self, "training", True):
            return x
        if mask is None:
            if self._rng is None:
                raise RuntimeError("dropout needs a mask from the caller")
            keep = _as_tensor((self._rng.random(x.data.shape) >= self.p).astype(np.float64))
        else:
            keep = _as_tensor(mask)
        if self.p >= 1.0:
            return x * keep * 0.0
        return x * keep * (1.0 / (1.0 - self.p))


class Sequential(Module):
    def __init__(self, *layers):
        self.layers = list(layers)

    def forward(self, x):
        for layer in self.layers:
            x = layer(x)
        return x


def _pair(value):
    if isinstance(value, (tuple, list)):
        return int(value[0]), int(value[1])
    return int(value), int(value)


def _im2col(src, kh, kw, sh, sw):
    n, channels, height, width = src.shape
    out_h = (height - kh) // sh + 1
    out_w = (width - kw) // sw + 1
    stride = src.strides
    view = np.lib.stride_tricks.as_strided(
        src,
        shape=(n, channels, out_h, out_w, kh, kw),
        strides=(stride[0], stride[1], sh * stride[2], sw * stride[3], stride[2], stride[3]),
    )
    cols = np.transpose(view, (0, 2, 3, 1, 4, 5)).reshape(n, out_h, out_w, channels * kh * kw)
    return np.ascontiguousarray(cols)


def _col2im(grad, height, width, kh, kw, sh, sw):
    n, out_h, out_w, channels, _, _ = grad.shape
    out = np.zeros((n, channels, height, width), dtype=np.float64)
    for ky in range(kh):
        for kx in range(kw):
            patch = np.transpose(grad[:, :, :, :, ky, kx], (0, 3, 1, 2))
            ys = ky + np.arange(out_h) * sh
            xs = kx + np.arange(out_w) * sw
            for row, y in enumerate(ys):
                out[:, :, y, xs] += patch[:, :, row, :]
    return out


def conv2d(x, weight, bias, stride=(1, 1), padding=(0, 0)):
    """Cross-correlation. im2col, then one matrix product. NCHW in and out."""
    x = _as_tensor(x)
    weight = _as_tensor(weight)
    bias_t = None if bias is None else _as_tensor(bias)
    sh, sw = stride
    ph, pw = padding
    kh, kw = int(weight.data.shape[2]), int(weight.data.shape[3])
    src = x.data
    if ph or pw:
        src = np.pad(src, ((0, 0), (0, 0), (ph, ph), (pw, pw)))
    n, cin, height, width = src.shape
    cout = int(weight.data.shape[0])
    out_h = (height - kh) // sh + 1
    out_w = (width - kw) // sw + 1
    if out_h < 1 or out_w < 1:
        raise ValueError("convolution output is empty")
    cols = _im2col(src, kh, kw, sh, sw)
    flat_w = weight.data.reshape(cout, -1)
    out_nhwc = cols @ flat_w.T
    if bias_t is not None:
        out_nhwc = out_nhwc + bias_t.data.reshape(1, 1, 1, -1)
    need = x.requires_grad or weight.requires_grad or (bias_t is not None and bias_t.requires_grad)
    prev = (x, weight) if bias_t is None else (x, weight, bias_t)
    out = Tensor(np.transpose(out_nhwc, (0, 3, 1, 2)), need, prev)

    def backward():
        if out.grad is None:
            return
        grad_nhwc = np.transpose(out.grad, (0, 2, 3, 1))
        if weight.requires_grad:
            dw = grad_nhwc.reshape(-1, cout).T @ cols.reshape(-1, cols.shape[-1])
            weight.grad = _acc(weight.grad, dw.reshape(weight.data.shape))
        if bias_t is not None and bias_t.requires_grad:
            bias_t.grad = _acc(bias_t.grad, grad_nhwc.sum(axis=(0, 1, 2)))
        if x.requires_grad:
            dcols = (grad_nhwc @ flat_w).reshape(n, out_h, out_w, cin, kh, kw)
            padded = _col2im(dcols, height, width, kh, kw, sh, sw)
            if ph or pw:
                padded = padded[:, :, ph : height - ph, pw : width - pw]
            x.grad = _acc(x.grad, padded)

    out._backward = backward
    return out


class Conv2d(Module):
    def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0, bias=True):
        self.stride = _pair(stride)
        self.padding = _pair(padding)
        kh, kw = _pair(kernel_size)
        limit = 1.0 / np.sqrt(in_channels * kh * kw)
        self.weight = Tensor(
            np.random.uniform(-limit, limit, (out_channels, in_channels, kh, kw)),
            requires_grad=True,
        )
        self.bias = Tensor(np.zeros(out_channels), requires_grad=True) if bias else None

    def forward(self, x):
        return conv2d(x, self.weight, self.bias, self.stride, self.padding)


def _pool2d(x, kernel, stride, padding, kind):
    x = _as_tensor(x)
    kh, kw = kernel
    sh, sw = stride
    ph, pw = padding
    src = x.data
    if ph or pw:
        fill = -np.inf if kind == "max" else 0.0
        src = np.pad(src, ((0, 0), (0, 0), (ph, ph), (pw, pw)), constant_values=fill)
    n, channels, height, width = src.shape
    out_h = (height - kh) // sh + 1
    out_w = (width - kw) // sw + 1
    if out_h < 1 or out_w < 1:
        raise ValueError("pooling output is empty")
    windows = _im2col(src, kh, kw, sh, sw).reshape(n, out_h, out_w, channels, kh, kw)
    windows = np.transpose(windows, (0, 3, 1, 2, 4, 5))
    if kind == "max":
        flat = windows.reshape(n, channels, out_h, out_w, kh * kw)
        index = np.argmax(flat, axis=-1)
        out_data = np.take_along_axis(flat, index[..., None], axis=-1)[..., 0]
    else:
        index = None
        out_data = windows.mean(axis=(-2, -1))
    out = Tensor(out_data, x.requires_grad, (x,))

    def backward():
        if not x.requires_grad:
            return
        if kind == "max":
            grad_flat = np.zeros((n, channels, out_h, out_w, kh * kw), dtype=np.float64)
            np.put_along_axis(grad_flat, index[..., None], out.grad[..., None], axis=-1)
            spread = grad_flat.reshape(n, channels, out_h, out_w, kh, kw)
        else:
            spread = np.empty((n, channels, out_h, out_w, kh, kw), dtype=np.float64)
            spread[...] = out.grad[:, :, :, :, None, None] / float(kh * kw)
        grad = np.transpose(spread, (0, 2, 3, 1, 4, 5))
        padded = _col2im(grad, height, width, kh, kw, sh, sw)
        if ph or pw:
            padded = padded[:, :, ph : height - ph, pw : width - pw]
        x.grad = _acc(x.grad, padded)

    out._backward = backward
    return out


class MaxPool2d(Module):
    def __init__(self, kernel_size, stride=None, padding=0):
        self.kernel = _pair(kernel_size)
        self.stride = _pair(kernel_size if stride is None else stride)
        self.padding = _pair(padding)

    def forward(self, x):
        return _pool2d(x, self.kernel, self.stride, self.padding, "max")


class AvgPool2d(Module):
    def __init__(self, kernel_size, stride=None, padding=0):
        self.kernel = _pair(kernel_size)
        self.stride = _pair(kernel_size if stride is None else stride)
        self.padding = _pair(padding)

    def forward(self, x):
        return _pool2d(x, self.kernel, self.stride, self.padding, "avg")


def conv_transpose2d(x, weight, bias, stride=(1, 1), padding=(0, 0)):
    """Paint each input pixel with a kernel. Weight is (in, out, kH, kW)."""
    x = _as_tensor(x)
    weight = _as_tensor(weight)
    bias_t = None if bias is None else _as_tensor(bias)
    sh, sw = int(stride[0]), int(stride[1])
    ph, pw = int(padding[0]), int(padding[1])
    n, cin, height, width = x.data.shape
    cin_w, cout, kh, kw = weight.data.shape
    if cin_w != cin:
        raise ValueError("transpose conv channel mismatch")
    out_h = (height - 1) * sh + kh - 2 * ph
    out_w = (width - 1) * sw + kw - 2 * pw
    if out_h < 1 or out_w < 1:
        raise ValueError("transpose convolution output is empty")
    full_h = out_h + 2 * ph
    full_w = out_w + 2 * pw
    acc = np.zeros((n, cout, full_h, full_w), dtype=np.float64)
    for ky in range(kh):
        for kx in range(kw):
            patch = np.einsum("nchw,co->nohw", x.data, weight.data[:, :, ky, kx])
            ys = ky + np.arange(height) * sh
            xs = kx + np.arange(width) * sw
            for row, y in enumerate(ys):
                acc[:, :, y, xs] += patch[:, :, row, :]
    out_data = acc[:, :, ph : ph + out_h, pw : pw + out_w]
    if bias_t is not None:
        out_data = out_data + bias_t.data.reshape(1, -1, 1, 1)
    need = x.requires_grad or weight.requires_grad or (bias_t is not None and bias_t.requires_grad)
    prev = (x, weight) if bias_t is None else (x, weight, bias_t)
    out = Tensor(out_data, need, prev)

    def backward():
        if out.grad is None:
            return
        dout = np.zeros((n, cout, full_h, full_w), dtype=np.float64)
        dout[:, :, ph : ph + out_h, pw : pw + out_w] = out.grad
        if x.requires_grad:
            dx = np.zeros_like(x.data)
        else:
            dx = None
        if weight.requires_grad:
            dw = np.zeros_like(weight.data)
        else:
            dw = None
        for ky in range(kh):
            for kx in range(kw):
                gathered = np.zeros((n, cout, height, width), dtype=np.float64)
                ys = ky + np.arange(height) * sh
                xs = kx + np.arange(width) * sw
                for row, y in enumerate(ys):
                    gathered[:, :, row, :] = dout[:, :, y, xs]
                if dx is not None:
                    dx += np.einsum("nohw,co->nchw", gathered, weight.data[:, :, ky, kx])
                if dw is not None:
                    dw[:, :, ky, kx] += np.einsum("nchw,nohw->co", x.data, gathered)
        if dx is not None:
            x.grad = _acc(x.grad, dx)
        if dw is not None:
            weight.grad = _acc(weight.grad, dw)
        if bias_t is not None and bias_t.requires_grad:
            bias_t.grad = _acc(bias_t.grad, out.grad.sum(axis=(0, 2, 3)))

    out._backward = backward
    return out


class ConvTranspose2d(Module):
    def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0, bias=True):
        self.stride = _pair(stride)
        self.padding = _pair(padding)
        kh, kw = _pair(kernel_size)
        limit = 1.0 / np.sqrt(in_channels * kh * kw)
        self.weight = Tensor(
            np.random.uniform(-limit, limit, (in_channels, out_channels, kh, kw)),
            requires_grad=True,
        )
        self.bias = Tensor(np.zeros(out_channels), requires_grad=True) if bias else None

    def forward(self, x):
        return conv_transpose2d(x, self.weight, self.bias, self.stride, self.padding)


def upsample_bilinear(x, size):
    """Resize NCHW with bilinear weights. size is (out_h, out_w)."""
    x = _as_tensor(x)
    n, channels, height, width = x.data.shape
    out_h, out_w = int(size[0]), int(size[1])
    y = (np.arange(out_h, dtype=np.float64) + 0.5) * (height / float(out_h)) - 0.5
    xcoord = (np.arange(out_w, dtype=np.float64) + 0.5) * (width / float(out_w)) - 0.5
    y0 = np.floor(y).astype(np.int64)
    x0 = np.floor(xcoord).astype(np.int64)
    y1 = y0 + 1
    x1 = x0 + 1

    def inside(idx, limit):
        return (idx >= 0) & (idx < limit)

    y0c = np.clip(y0, 0, height - 1)
    y1c = np.clip(y1, 0, height - 1)
    x0c = np.clip(x0, 0, width - 1)
    x1c = np.clip(x1, 0, width - 1)
    wy1 = (y - y0) * inside(y1, height)
    wy0 = (1.0 - (y - y0)) * inside(y0, height)
    wx1 = (xcoord - x0) * inside(x1, width)
    wx0 = (1.0 - (xcoord - x0)) * inside(x0, width)
    src = x.data
    top = src[:, :, y0c, :]
    bot = src[:, :, y1c, :]
    Ia = top[:, :, :, x0c]
    Ib = top[:, :, :, x1c]
    Ic = bot[:, :, :, x0c]
    Id = bot[:, :, :, x1c]
    wa = wy0[:, None] * wx0[None, :]
    wb = wy0[:, None] * wx1[None, :]
    wc = wy1[:, None] * wx0[None, :]
    wd = wy1[:, None] * wx1[None, :]
    out = Tensor(Ia * wa + Ib * wb + Ic * wc + Id * wd, x.requires_grad, (x,))

    def backward():
        if out.grad is None or not x.requires_grad:
            return
        grad = np.zeros_like(src)
        g = out.grad
        np.add.at(grad, (slice(None), slice(None), y0c[:, None], x0c[None, :]), g * wa)
        np.add.at(grad, (slice(None), slice(None), y0c[:, None], x1c[None, :]), g * wb)
        np.add.at(grad, (slice(None), slice(None), y1c[:, None], x0c[None, :]), g * wc)
        np.add.at(grad, (slice(None), slice(None), y1c[:, None], x1c[None, :]), g * wd)
        x.grad = _acc(x.grad, grad)

    out._backward = backward
    return out


def roi_pool(features, boxes, output_size=2):
    """Max-pool each box into a fixed grid. boxes are (index, x1, y1, x2, y2)."""
    features = _as_tensor(features)
    boxes = np.asarray(boxes, dtype=np.float64)
    oh, ow = _pair(output_size)
    n, channels, height, width = features.data.shape
    count = int(boxes.shape[0])
    out_data = np.zeros((count, channels, oh, ow), dtype=np.float64)
    pick_y = np.zeros((count, channels, oh, ow), dtype=np.int64)
    pick_x = np.zeros((count, channels, oh, ow), dtype=np.int64)
    pick_b = np.zeros(count, dtype=np.int64)
    data = features.data
    for i in range(count):
        batch = int(boxes[i, 0])
        pick_b[i] = batch
        x1 = float(np.clip(boxes[i, 1], 0, width - 1))
        y1 = float(np.clip(boxes[i, 2], 0, height - 1))
        x2 = float(np.clip(boxes[i, 3], x1 + 1.0, width))
        y2 = float(np.clip(boxes[i, 4], y1 + 1.0, height))
        bin_w = max(x2 - x1, 1.0) / float(ow)
        bin_h = max(y2 - y1, 1.0) / float(oh)
        for by in range(oh):
            y_start = max(0, int(np.floor(y1 + by * bin_h)))
            y_end = min(height, max(y_start + 1, int(np.ceil(y1 + (by + 1) * bin_h))))
            for bx in range(ow):
                x_start = max(0, int(np.floor(x1 + bx * bin_w)))
                x_end = min(width, max(x_start + 1, int(np.ceil(x1 + (bx + 1) * bin_w))))
                patch = data[batch, :, y_start:y_end, x_start:x_end]
                local_w = x_end - x_start
                flat = patch.reshape(channels, -1)
                choice = flat.argmax(axis=1)
                out_data[i, :, by, bx] = flat[np.arange(channels), choice]
                pick_y[i, :, by, bx] = y_start + choice // local_w
                pick_x[i, :, by, bx] = x_start + choice % local_w
    out = Tensor(out_data, features.requires_grad, (features,))

    def backward():
        if out.grad is None or not features.requires_grad:
            return
        grad = np.zeros_like(data)
        channels = data.shape[1]
        channel = np.arange(channels)
        for i in range(count):
            for by in range(oh):
                for bx in range(ow):
                    grad[pick_b[i], channel, pick_y[i, :, by, bx], pick_x[i, :, by, bx]] += out.grad[i, :, by, bx]
        features.grad = _acc(features.grad, grad)

    out._backward = backward
    return out


def box_iou(boxes_a, boxes_b):
    """Intersection over union. Each box is x1, y1, x2, y2."""
    left = np.asarray(boxes_a, dtype=np.float64).reshape(-1, 4)
    right = np.asarray(boxes_b, dtype=np.float64).reshape(-1, 4)
    tl = np.maximum(left[:, None, :2], right[None, :, :2])
    br = np.minimum(left[:, None, 2:], right[None, :, 2:])
    wh = np.maximum(br - tl, 0.0)
    inter = wh[:, :, 0] * wh[:, :, 1]
    area_l = np.maximum(left[:, 2] - left[:, 0], 0.0) * np.maximum(left[:, 3] - left[:, 1], 0.0)
    area_r = np.maximum(right[:, 2] - right[:, 0], 0.0) * np.maximum(right[:, 3] - right[:, 1], 0.0)
    union = area_l[:, None] + area_r[None, :] - inter
    return inter / np.maximum(union, 1e-12)


def multibox_prior(height, width, sizes, ratios):
    """One anchor list in unit coordinates. size 0 pairs with every ratio."""
    sizes = [float(item) for item in sizes]
    ratios = [float(item) for item in ratios]
    pairs = [(sizes[0], ratio) for ratio in ratios]
    for size in sizes[1:]:
        pairs.append((size, 1.0))
    cy = (np.arange(int(height), dtype=np.float64) + 0.5) / float(height)
    cx = (np.arange(int(width), dtype=np.float64) + 0.5) / float(width)
    anchors = np.empty((height * width * len(pairs), 4), dtype=np.float64)
    cursor = 0
    for y in cy:
        for x in cx:
            for size, ratio in pairs:
                bw = size * np.sqrt(ratio)
                bh = size / np.sqrt(ratio)
                anchors[cursor] = (x - bw / 2.0, y - bh / 2.0, x + bw / 2.0, y + bh / 2.0)
                cursor += 1
    return anchors


def nms(boxes, scores, threshold):
    """Greedy suppression. Returns kept indexes, highest score first."""
    boxes = np.asarray(boxes, dtype=np.float64).reshape(-1, 4)
    scores = np.asarray(scores, dtype=np.float64).reshape(-1)
    order = scores.argsort()[::-1]
    kept = []
    while order.size:
        current = int(order[0])
        kept.append(current)
        if order.size == 1:
            break
        rest = order[1:]
        overlap = box_iou(boxes[current : current + 1], boxes[rest]).reshape(-1)
        order = rest[overlap <= float(threshold)]
    return np.asarray(kept, dtype=np.int64)


class Flatten(Module):
    def forward(self, x):
        x = _as_tensor(x)
        return x.reshape(x.shape[0], -1)


class Sigmoid(Module):
    def forward(self, x):
        return _as_tensor(x).sigmoid()


def _bn_view(data):
    if data.ndim == 2:
        return (0,), (1, -1)
    if data.ndim == 4:
        return (0, 2, 3), (1, -1, 1, 1)
    raise ValueError("batch norm expects shape NC or NCHW")


def batch_norm(x, gamma, beta, running_mean, running_var, training, eps, momentum):
    x = _as_tensor(x)
    gamma = _as_tensor(gamma)
    beta = _as_tensor(beta)
    axes, view = _bn_view(x.data)
    if training:
        mean = x.data.mean(axis=axes)
        centered = x.data - mean.reshape(view)
        var = (centered * centered).mean(axis=axes)
        inv = 1.0 / np.sqrt(var + eps)
        xhat = centered * inv.reshape(view)
        count = x.data.size / x.data.shape[1]
        unbiased = var if count <= 1 else var * (count / (count - 1.0))
        running_mean *= 1.0 - momentum
        running_mean += momentum * mean
        running_var *= 1.0 - momentum
        running_var += momentum * unbiased
    else:
        mean = running_mean
        var = running_var
        inv = 1.0 / np.sqrt(var + eps)
        xhat = (x.data - mean.reshape(view)) * inv.reshape(view)
    out_data = xhat * gamma.data.reshape(view) + beta.data.reshape(view)
    need = x.requires_grad or gamma.requires_grad or beta.requires_grad
    out = Tensor(out_data, need, (x, gamma, beta))

    def backward():
        grad = out.grad
        if gamma.requires_grad:
            gamma.grad = _acc(gamma.grad, (grad * xhat).sum(axis=axes))
        if beta.requires_grad:
            beta.grad = _acc(beta.grad, grad.sum(axis=axes))
        if not x.requires_grad:
            return
        dxhat = grad * gamma.data.reshape(view)
        if training:
            count = x.data.size / x.data.shape[1]
            summed = dxhat.sum(axis=axes).reshape(view)
            dotted = (dxhat * xhat).sum(axis=axes).reshape(view)
            dx = inv.reshape(view) * (dxhat - summed / count - xhat * dotted / count)
        else:
            dx = dxhat * inv.reshape(view)
        x.grad = _acc(x.grad, dx)

    out._backward = backward
    return out


class BatchNorm(Module):
    def __init__(self, num_features, eps=1e-5, momentum=0.1):
        self.eps = float(eps)
        self.momentum = float(momentum)
        self.weight = Tensor(np.ones(num_features), requires_grad=True)
        self.bias = Tensor(np.zeros(num_features), requires_grad=True)
        self.running_mean = np.zeros(num_features, dtype=np.float64)
        self.running_var = np.ones(num_features, dtype=np.float64)

    def forward(self, x):
        return batch_norm(
            x,
            self.weight,
            self.bias,
            self.running_mean,
            self.running_var,
            getattr(self, "training", True),
            self.eps,
            self.momentum,
        )


class Embedding(Module):
    """Row lookup. The backward pass scatters into the selected rows."""

    def __init__(self, num_embeddings, embed_dim):
        scale = 1.0 / np.sqrt(float(embed_dim))
        self.weight = Tensor(
            np.random.uniform(-scale, scale, (int(num_embeddings), int(embed_dim))),
            requires_grad=True,
        )

    def forward(self, indices):
        idx = np.asarray(indices.data if isinstance(indices, Tensor) else indices, dtype=np.int64)
        out = Tensor(self.weight.data[idx], self.weight.requires_grad, (self.weight,))

        def backward():
            if not self.weight.requires_grad:
                return
            grad = np.zeros_like(self.weight.data)
            np.add.at(grad, idx, out.grad)
            self.weight.grad = _acc(self.weight.grad, grad)

        out._backward = backward
        return out


def _recurrent_weight(rows, cols, scale):
    return Tensor(np.random.uniform(-scale, scale, (rows, cols)), requires_grad=True)


class RNN(Module):
    """One tanh cell, batch on the outside: input (N, T, I), output (N, T, H)."""

    def __init__(self, input_size, hidden_size):
        self.hidden_size = int(hidden_size)
        scale = 1.0 / np.sqrt(float(hidden_size))
        self.weight_ih = _recurrent_weight(self.hidden_size, int(input_size), scale)
        self.weight_hh = _recurrent_weight(self.hidden_size, self.hidden_size, scale)
        self.bias = Tensor(np.zeros(self.hidden_size), requires_grad=True)

    def forward(self, x, state=None):
        x = _as_tensor(x)
        batch, steps, _ = x.shape
        h = _as_tensor(state) if state is not None else Tensor(np.zeros((batch, self.hidden_size)))
        outputs = []
        for t in range(int(steps)):
            xt = x[:, t, :]
            h = (xt @ self.weight_ih.T + h @ self.weight_hh.T + self.bias).tanh()
            outputs.append(h.reshape(batch, 1, self.hidden_size))
        return cat(outputs, axis=1), h


class GRU(Module):
    """Reset and update gates. Same (N, T, I) layout as RNN."""

    def __init__(self, input_size, hidden_size):
        self.hidden_size = int(hidden_size)
        scale = 1.0 / np.sqrt(float(hidden_size))
        i = int(input_size)
        h = self.hidden_size
        self.weight_ir = _recurrent_weight(h, i, scale)
        self.weight_hr = _recurrent_weight(h, h, scale)
        self.bias_r = Tensor(np.zeros(h), requires_grad=True)
        self.weight_iz = _recurrent_weight(h, i, scale)
        self.weight_hz = _recurrent_weight(h, h, scale)
        self.bias_z = Tensor(np.zeros(h), requires_grad=True)
        self.weight_in = _recurrent_weight(h, i, scale)
        self.weight_hn = _recurrent_weight(h, h, scale)
        self.bias_n = Tensor(np.zeros(h), requires_grad=True)

    def forward(self, x, state=None):
        x = _as_tensor(x)
        batch, steps, _ = x.shape
        h = _as_tensor(state) if state is not None else Tensor(np.zeros((batch, self.hidden_size)))
        outputs = []
        for t in range(int(steps)):
            xt = x[:, t, :]
            reset = (xt @ self.weight_ir.T + h @ self.weight_hr.T + self.bias_r).sigmoid()
            update = (xt @ self.weight_iz.T + h @ self.weight_hz.T + self.bias_z).sigmoid()
            candidate = (xt @ self.weight_in.T + (reset * h) @ self.weight_hn.T + self.bias_n).tanh()
            h = (1.0 - update) * candidate + update * h
            outputs.append(h.reshape(batch, 1, self.hidden_size))
        return cat(outputs, axis=1), h


class LSTM(Module):
    """Input, forget, cell, and output gates. state is (hidden, cell)."""

    def __init__(self, input_size, hidden_size):
        self.hidden_size = int(hidden_size)
        scale = 1.0 / np.sqrt(float(hidden_size))
        i = int(input_size)
        h = self.hidden_size
        self.weight_ii = _recurrent_weight(h, i, scale)
        self.weight_hi = _recurrent_weight(h, h, scale)
        self.bias_i = Tensor(np.zeros(h), requires_grad=True)
        self.weight_if = _recurrent_weight(h, i, scale)
        self.weight_hf = _recurrent_weight(h, h, scale)
        self.bias_f = Tensor(np.zeros(h), requires_grad=True)
        self.weight_ig = _recurrent_weight(h, i, scale)
        self.weight_hg = _recurrent_weight(h, h, scale)
        self.bias_g = Tensor(np.zeros(h), requires_grad=True)
        self.weight_io = _recurrent_weight(h, i, scale)
        self.weight_ho = _recurrent_weight(h, h, scale)
        self.bias_o = Tensor(np.zeros(h), requires_grad=True)

    def forward(self, x, state=None):
        x = _as_tensor(x)
        batch, steps, _ = x.shape
        if state is None:
            h = Tensor(np.zeros((batch, self.hidden_size)))
            c = Tensor(np.zeros((batch, self.hidden_size)))
        else:
            h, c = state
            h = _as_tensor(h)
            c = _as_tensor(c)
        outputs = []
        for t in range(int(steps)):
            xt = x[:, t, :]
            gate_i = (xt @ self.weight_ii.T + h @ self.weight_hi.T + self.bias_i).sigmoid()
            gate_f = (xt @ self.weight_if.T + h @ self.weight_hf.T + self.bias_f).sigmoid()
            gate_g = (xt @ self.weight_ig.T + h @ self.weight_hg.T + self.bias_g).tanh()
            gate_o = (xt @ self.weight_io.T + h @ self.weight_ho.T + self.bias_o).sigmoid()
            c = gate_f * c + gate_i * gate_g
            h = gate_o * c.tanh()
            outputs.append(h.reshape(batch, 1, self.hidden_size))
        return cat(outputs, axis=1), (h, c)


class LayerNorm(Module):
    """Normalize the last axis, then apply a learned scale and shift."""

    def __init__(self, dim, eps=1e-5):
        self.eps = float(eps)
        self.weight = Tensor(np.ones(int(dim)), requires_grad=True)
        self.bias = Tensor(np.zeros(int(dim)), requires_grad=True)

    def forward(self, x):
        x = _as_tensor(x)
        mean = x.mean(axis=-1, keepdims=True)
        centered = x - mean
        var = (centered * centered).mean(axis=-1, keepdims=True)
        hat = centered / (var + self.eps).sqrt()
        return hat * self.weight + self.bias


class MultiHeadAttention(Module):
    """Project, split heads, scaled dot-product attention, then a final linear map."""

    def __init__(self, d_model, num_heads):
        self.d_model = int(d_model)
        self.num_heads = int(num_heads)
        if self.d_model % self.num_heads != 0:
            raise ValueError("d_model must divide into heads")
        self.depth = self.d_model // self.num_heads
        self.w_q = Linear(self.d_model, self.d_model)
        self.w_k = Linear(self.d_model, self.d_model)
        self.w_v = Linear(self.d_model, self.d_model)
        self.w_o = Linear(self.d_model, self.d_model)

    def _split(self, x):
        n, t, _ = x.shape
        return x.reshape(n, t, self.num_heads, self.depth).permute(0, 2, 1, 3)

    def forward(self, query, key, value):
        query = _as_tensor(query)
        n, t, _ = query.shape
        q = self._split(self.w_q(query))
        k = self._split(self.w_k(_as_tensor(key)))
        v = self._split(self.w_v(_as_tensor(value)))
        context, _weights = dot_attention(q, k, v)
        merged = context.permute(0, 2, 1, 3).reshape(n, t, self.d_model)
        return self.w_o(merged)


def cat(tensors, axis=1):
    parts = [_as_tensor(item) for item in tensors]
    data = np.concatenate([item.data for item in parts], axis=axis)
    out = Tensor(data, any(item.requires_grad for item in parts), tuple(parts))

    def backward():
        sizes = [item.data.shape[axis] for item in parts]
        splits = np.cumsum(sizes)[:-1]
        grads = np.split(out.grad, splits, axis=axis) if splits.size else [out.grad]
        for item, grad in zip(parts, grads):
            if item.requires_grad:
                item.grad = _acc(item.grad, grad)

    out._backward = backward
    return out


def save_npz(path, arrays):
    payload = {}
    for key, value in arrays.items():
        payload[str(key)] = value.data if isinstance(value, Tensor) else np.asarray(value, dtype=np.float64)
    np.savez(path, **payload)


def load_npz(path):
    with np.load(path) as data:
        return {key: np.array(data[key]) for key in data.files}


def clip_grad(params, max_norm):
    """Scale every gradient in place when the global L2 norm exceeds max_norm."""
    listed = list(params)
    total = 0.0
    for param in listed:
        if param.grad is None:
            continue
        total += float(np.sum(param.grad * param.grad))
    norm = float(np.sqrt(total))
    cap = float(max_norm)
    if norm > cap and norm > 0.0:
        scale = cap / (norm + 1e-12)
        for param in listed:
            if param.grad is not None:
                param.grad *= scale
    return norm


def softmax_last(logits):
    """Softmax over the last axis, kept as a tensor so the graph stays intact."""
    logits = _as_tensor(logits)
    shift = logits.data.max(axis=-1, keepdims=True)
    ex = (logits - shift).exp()
    return ex / ex.sum(axis=-1, keepdims=True)


def dot_attention(query, key, value):
    """Scaled dot-product attention. Returns context and the weight tensor."""
    query = _as_tensor(query)
    key = _as_tensor(key)
    value = _as_tensor(value)
    scale = float(np.sqrt(query.shape[-1]))
    weights = softmax_last((query @ key.transpose()) / scale)
    return weights @ value, weights


def positional_encoding(length, d_model):
    """Sine and cosine positions. A constant, not a parameter."""
    length = int(length)
    width = int(d_model)
    pos = np.arange(length, dtype=np.float64)[:, None]
    index = np.arange(width, dtype=np.float64)[None, :]
    angle = pos / np.power(10000.0, (2.0 * np.floor(index / 2.0)) / float(width))
    even = index % 2.0 == 0.0
    return np.where(even, np.sin(angle), np.cos(angle)).astype(np.float64)


def flip_time(x):
    """Reverse the time axis of an (N, T, D) tensor. Used by a backward RNN."""
    x = _as_tensor(x)
    index = np.arange(x.shape[1] - 1, -1, -1)
    return x[:, index, :]


class SGD:
    def __init__(self, params, lr=0.1, weight_decay=0.0):
        self.params = list(params)
        self.lr = float(lr)
        self.weight_decay = float(weight_decay)

    def zero_grad(self):
        for param in self.params:
            param.grad = None

    def step(self):
        for param in self.params:
            if param.grad is None:
                continue
            grad = param.grad
            if self.weight_decay:
                grad = grad + self.weight_decay * param.data
            param.data -= self.lr * grad


class Adam:
    def __init__(self, params, lr=0.01, betas=(0.9, 0.999), eps=1e-8):
        self.params = list(params)
        self.lr = float(lr)
        self.beta1 = float(betas[0])
        self.beta2 = float(betas[1])
        self.eps = float(eps)
        self.step_n = 0
        self.moment = [np.zeros_like(param.data) for param in self.params]
        self.velocity = [np.zeros_like(param.data) for param in self.params]

    def zero_grad(self):
        for param in self.params:
            param.grad = None

    def step(self):
        self.step_n += 1
        for index, param in enumerate(self.params):
            if param.grad is None:
                continue
            grad = param.grad
            self.moment[index] = self.beta1 * self.moment[index] + (1.0 - self.beta1) * grad
            self.velocity[index] = self.beta2 * self.velocity[index] + (1.0 - self.beta2) * (grad * grad)
            moment = self.moment[index] / (1.0 - self.beta1**self.step_n)
            velocity = self.velocity[index] / (1.0 - self.beta2**self.step_n)
            param.data -= self.lr * moment / (np.sqrt(velocity) + self.eps)


class Momentum:
    def __init__(self, params, lr=0.1, momentum=0.9):
        self.params = list(params)
        self.lr = float(lr)
        self.momentum = float(momentum)
        self.velocity = [np.zeros_like(param.data) for param in self.params]

    def zero_grad(self):
        for param in self.params:
            param.grad = None

    def step(self):
        for index, param in enumerate(self.params):
            if param.grad is None:
                continue
            self.velocity[index] = self.momentum * self.velocity[index] + param.grad
            param.data -= self.lr * self.velocity[index]


class AdaGrad:
    def __init__(self, params, lr=0.1, eps=1e-8):
        self.params = list(params)
        self.lr = float(lr)
        self.eps = float(eps)
        self.accum = [np.zeros_like(param.data) for param in self.params]

    def zero_grad(self):
        for param in self.params:
            param.grad = None

    def step(self):
        for index, param in enumerate(self.params):
            if param.grad is None:
                continue
            grad = param.grad
            self.accum[index] = self.accum[index] + grad * grad
            param.data -= self.lr * grad / (np.sqrt(self.accum[index]) + self.eps)


class RMSProp:
    def __init__(self, params, lr=0.01, rho=0.99, eps=1e-8):
        self.params = list(params)
        self.lr = float(lr)
        self.rho = float(rho)
        self.eps = float(eps)
        self.accum = [np.zeros_like(param.data) for param in self.params]

    def zero_grad(self):
        for param in self.params:
            param.grad = None

    def step(self):
        for index, param in enumerate(self.params):
            if param.grad is None:
                continue
            grad = param.grad
            self.accum[index] = self.rho * self.accum[index] + (1.0 - self.rho) * (grad * grad)
            param.data -= self.lr * grad / (np.sqrt(self.accum[index]) + self.eps)


class Adadelta:
    def __init__(self, params, lr=1.0, rho=0.9, eps=1e-6):
        self.params = list(params)
        self.lr = float(lr)
        self.rho = float(rho)
        self.eps = float(eps)
        self.square = [np.zeros_like(param.data) for param in self.params]
        self.delta = [np.zeros_like(param.data) for param in self.params]

    def zero_grad(self):
        for param in self.params:
            param.grad = None

    def step(self):
        for index, param in enumerate(self.params):
            if param.grad is None:
                continue
            grad = param.grad
            self.square[index] = self.rho * self.square[index] + (1.0 - self.rho) * (grad * grad)
            update = np.sqrt(self.delta[index] + self.eps) / np.sqrt(self.square[index] + self.eps) * grad
            self.delta[index] = self.rho * self.delta[index] + (1.0 - self.rho) * (update * update)
            param.data -= self.lr * update


class StepLR:
    """Multiply an optimizer's learning rate by gamma every step_size scheduler steps."""

    def __init__(self, optimizer, step_size, gamma=0.5):
        self.optimizer = optimizer
        self.step_size = int(step_size)
        self.gamma = float(gamma)
        self.base = float(optimizer.lr)
        self.n = 0

    def step(self):
        self.n += 1
        self.optimizer.lr = self.base * (self.gamma ** (self.n // self.step_size))


class _NN:
    Module = Module
    Linear = Linear
    ReLU = ReLU
    Sigmoid = Sigmoid
    Dropout = Dropout
    Sequential = Sequential
    Conv2d = Conv2d
    MaxPool2d = MaxPool2d
    AvgPool2d = AvgPool2d
    ConvTranspose2d = ConvTranspose2d
    Flatten = Flatten
    BatchNorm = BatchNorm
    Embedding = Embedding
    RNN = RNN
    GRU = GRU
    LSTM = LSTM
    LayerNorm = LayerNorm
    MultiHeadAttention = MultiHeadAttention


class _Optim:
    SGD = SGD
    Momentum = Momentum
    AdaGrad = AdaGrad
    RMSProp = RMSProp
    Adadelta = Adadelta
    Adam = Adam
    StepLR = StepLR


def scale_batch(images):
    """Convert one uint8 image batch to float64 in [0, 1]. Do not scale the whole table first."""
    return np.asarray(images, dtype=np.float64) / 255.0


def accuracy(logits, targets):
    labels = np.asarray(targets.data if isinstance(targets, Tensor) else targets, dtype=np.int64).reshape(-1)
    pred = np.asarray(logits.data if isinstance(logits, Tensor) else logits).argmax(axis=-1).reshape(-1)
    return float((pred == labels).mean())


def fashion_mnist(n_train=32, n_test=8, path="/data/fashion-mnist.bin"):
    with open(path, "rb") as handle:
        blob = handle.read()
    magic, train_count, test_count = struct.unpack_from("<III", blob, 0)
    if magic != 0x314E4D46:
        raise ValueError("fashion-mnist subset header is not FMN1")
    offset = 12
    train_x = np.frombuffer(blob, dtype=np.uint8, count=train_count * 784, offset=offset).reshape(train_count, 784)
    offset += train_count * 784
    train_y = np.frombuffer(blob, dtype=np.uint8, count=train_count, offset=offset)
    offset += train_count
    test_x = np.frombuffer(blob, dtype=np.uint8, count=test_count * 784, offset=offset).reshape(test_count, 784)
    offset += test_count * 784
    test_y = np.frombuffer(blob, dtype=np.uint8, count=test_count, offset=offset)
    train_n = min(int(n_train), int(train_count))
    test_n = min(int(n_test), int(test_count))
    return (
        train_x[:train_n],
        train_y[:train_n].astype(np.int64),
        test_x[:test_n],
        test_y[:test_n].astype(np.int64),
    )


def _read_numeric_csv(path):
    rows = []
    with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if any(ch.isalpha() for ch in line):
                continue
            rows.append([float(part) for part in line.split(",")])
    if not rows:
        raise ValueError("no numeric rows in " + path)
    return np.asarray(rows, dtype=np.float64)


def house_prices(path="/data/house-tiny.csv"):
    data = _read_numeric_csv(path)
    if data.shape[0] < 24:
        raise ValueError("house sample needs 16 train rows and 8 validation rows")
    train = data[:16]
    val = data[16:24]
    return train[:, :-1], train[:, -1], val[:, :-1], val[:, -1]


def airfoil(path="/data/airfoil-tiny.csv"):
    data = _read_numeric_csv(path)
    if data.shape[0] < 32:
        raise ValueError("airfoil sample needs 32 rows")
    data = data[:32]
    return data[:, :-1], data[:, -1]


def time_machine(path="/data/timemachine.txt"):
    """Short synthetic prose used as a stand-in for a public-domain excerpt."""
    with open(path, "r", encoding="utf-8") as handle:
        text = handle.read()
    if len(text) < 256:
        raise ValueError("time-machine sample is too short")
    return text


def translation_pairs(path="/data/fra-eng.txt"):
    """16 train pairs and 8 validation pairs. Synthetic, not a Tatoeba extract."""
    rows = []
    with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            english, french = line.split("\t")
            rows.append((english, french))
    if len(rows) < 24:
        raise ValueError("translation sample needs 16 train pairs and 8 validation pairs")
    return rows[:16], rows[16:24]


def _toy_images(count, size, channels, seed):
    rng = np.random.RandomState(int(seed))
    return rng.randint(0, 256, size=(int(count), int(channels), int(size), int(size))).astype(np.uint8)


def finetune_images():
    """8 synthetic 32x32 images, two classes, 4 train and 4 check. Not hotdog.zip."""
    images = _toy_images(8, 32, 1, 20261116)
    labels = np.array([0, 0, 0, 0, 1, 1, 1, 1], dtype=np.int64)
    return images[:4], labels[:4], images[4:], labels[4:]


def detect_images():
    """8 train and 2 check images, each with one box. Not the banana archive."""
    images = _toy_images(10, 32, 1, 20261117)
    boxes = np.zeros((10, 4), dtype=np.float64)
    labels = np.zeros(10, dtype=np.int64)
    for i in range(10):
        x1 = 4 + (i % 5)
        y1 = 6
        boxes[i] = (x1, y1, x1 + 12, y1 + 10)
        labels[i] = i % 2
    return images[:8], boxes[:8], labels[:8], images[8:], boxes[8:], labels[8:]


def segment_images():
    """4 images and matching label maps. Not Pascal VOC."""
    images = _toy_images(4, 32, 1, 20261118)
    masks = np.zeros((4, 32, 32), dtype=np.int64)
    masks[:, 8:24, 8:24] = 1
    return images, masks


def cifar_images():
    """16 train and 4 check RGB images, 4 labels. Not the CIFAR zip."""
    images = _toy_images(20, 32, 3, 20261119)
    labels = np.arange(20, dtype=np.int64) % 4
    return images[:16], labels[:16], images[16:], labels[16:]


def dog_images():
    """8 train and 2 check RGB images, 2 breeds. Not the breed archive."""
    images = _toy_images(10, 32, 3, 20261120)
    labels = np.arange(10, dtype=np.int64) % 2
    return images[:8], labels[:8], images[8:], labels[8:]


class _Datasets:
    fashion_mnist = staticmethod(fashion_mnist)
    scale_batch = staticmethod(scale_batch)
    house_prices = staticmethod(house_prices)
    airfoil = staticmethod(airfoil)
    time_machine = staticmethod(time_machine)
    translation_pairs = staticmethod(translation_pairs)
    finetune_images = staticmethod(finetune_images)
    detect_images = staticmethod(detect_images)
    segment_images = staticmethod(segment_images)
    cifar_images = staticmethod(cifar_images)
    dog_images = staticmethod(dog_images)


nn = _NN()
optim = _Optim()
datasets = _Datasets()

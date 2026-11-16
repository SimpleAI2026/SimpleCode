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

    def __matmul__(self, other):
        other = _as_tensor(other)
        out = Tensor(self.data @ other.data, self.requires_grad or other.requires_grad, (self, other))

        def backward():
            if self.requires_grad:
                self.grad = _acc(self.grad, out.grad @ np.swapaxes(other.data, -1, -2))
            if other.requires_grad:
                other.grad = _acc(other.grad, np.swapaxes(self.data, -1, -2) @ out.grad)

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
    Flatten = Flatten
    BatchNorm = BatchNorm


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


class _Datasets:
    fashion_mnist = staticmethod(fashion_mnist)
    scale_batch = staticmethod(scale_batch)
    house_prices = staticmethod(house_prices)
    airfoil = staticmethod(airfoil)


nn = _NN()
optim = _Optim()
datasets = _Datasets()

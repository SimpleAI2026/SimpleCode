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
        denom = self.data.size if axis is None else self.data.shape[axis]
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
    """Inverted dropout. The caller supplies the 0/1 keep mask so a block can use its own Generator."""

    def __init__(self, p=0.5):
        self.p = float(p)

    def forward(self, x, mask=None):
        x = _as_tensor(x)
        if not getattr(self, "training", True):
            return x
        if mask is None:
            raise RuntimeError("dropout needs a mask from the caller")
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
    Dropout = Dropout
    Sequential = Sequential


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

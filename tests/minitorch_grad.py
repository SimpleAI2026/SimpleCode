import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src" / "pyodide"))
import minitorch as mt
from minitorch import Tensor, cross_entropy


def check(name, got, want, tol=1e-6):
    got = np.asarray(got, dtype=np.float64)
    want = np.asarray(want, dtype=np.float64)
    if got.shape != want.shape or np.max(np.abs(got - want)) > tol:
        raise SystemExit(f"{name} got {got} want {want}")


def test_square():
    x = Tensor([1.0, 2.0, 3.0], requires_grad=True)
    loss = (x * x).sum()
    loss.backward()
    check("square", x.grad, [2.0, 4.0, 6.0])


def test_bias_broadcast():
    x = Tensor([[1.0, 2.0], [3.0, 4.0]], requires_grad=True)
    bias = Tensor([0.5, -1.0], requires_grad=True)
    loss = (x + bias).sum()
    loss.backward()
    check("x", x.grad, [[1.0, 1.0], [1.0, 1.0]])
    check("bias", bias.grad, [2.0, 2.0])


def test_linear_finite():
    np.random.seed(1)
    layer = mt.nn.Linear(3, 2)
    x = Tensor(np.random.randn(4, 3))
    y = layer(x).sum()
    y.backward()
    weight = layer.weight.data.copy()
    analytic = layer.weight.grad.copy()
    eps = 1e-5
    numeric = np.zeros_like(weight)
    for index in np.ndindex(weight.shape):
        layer.weight.data[index] = weight[index] + eps
        plus = layer(x).data.sum()
        layer.weight.data[index] = weight[index] - eps
        minus = layer(x).data.sum()
        layer.weight.data[index] = weight[index]
        numeric[index] = (plus - minus) / (2 * eps)
    check("linear weight", analytic, numeric, tol=1e-4)


def test_cross_entropy():
    logits = Tensor([[2.0, 0.5, -1.0], [0.0, 0.2, 0.3]], requires_grad=True)
    loss = cross_entropy(logits, [0, 2])
    loss.backward()
    base = logits.data.copy()
    analytic = logits.grad.copy()
    eps = 1e-5
    numeric = np.zeros_like(base)
    for index in np.ndindex(base.shape):
        logits.data[index] = base[index] + eps
        plus = cross_entropy(logits, [0, 2]).data
        logits.data[index] = base[index] - eps
        minus = cross_entropy(logits, [0, 2]).data
        logits.data[index] = base[index]
        numeric[index] = (plus - minus) / (2 * eps)
    check("cross entropy", analytic, numeric, tol=1e-4)


def test_xor():
    np.random.seed(0)
    model = mt.nn.Sequential(mt.nn.Linear(2, 8), mt.nn.ReLU(), mt.nn.Linear(8, 2))
    opt = mt.optim.SGD(model.parameters(), lr=0.4)
    x = Tensor([[0, 0], [0, 1], [1, 0], [1, 1]])
    y = np.array([0, 1, 1, 0])
    last = 1.0
    for _ in range(200):
        opt.zero_grad()
        logits = model(x)
        loss = cross_entropy(logits, y)
        loss.backward()
        opt.step()
        last = float(loss.data)
    pred = model(x).data.argmax(axis=1)
    if list(map(int, pred)) != [0, 1, 1, 0]:
        raise SystemExit(f"xor pred {pred} loss {last}")
    print(f"xor loss {last:.4f}")


def finite(name, value_fn, params, tol=1e-4):
    base = [param.data.copy() for param in params]
    for param in params:
        if param.requires_grad:
            param.grad = None
    loss = value_fn()
    loss.backward()
    analytics = [None if param.grad is None else param.grad.copy() for param in params]
    eps = 1e-5
    for param, origin, analytic in zip(params, base, analytics):
        if analytic is None:
            continue
        numeric = np.zeros_like(origin)
        for index in np.ndindex(origin.shape):
            param.data[index] = origin[index] + eps
            plus = float(value_fn().data)
            param.data[index] = origin[index] - eps
            minus = float(value_fn().data)
            param.data[index] = origin[index]
            numeric[index] = (plus - minus) / (2 * eps)
        check(name, analytic, numeric, tol=tol)
        param.grad = None


def test_exp_log_index():
    x = Tensor([0.5, 1.5], requires_grad=True)
    finite("exp", lambda: x.exp().sum(), [x])
    x.grad = None
    finite("log", lambda: x.log().sum(), [x])
    grid = Tensor([[1.0, 2.0], [3.0, 4.0]], requires_grad=True)
    finite("index", lambda: (grid[1, 0] * grid[1, 0]).reshape(1).sum(), [grid])
    picked = grid[0]
    picked.sum().backward()
    check("row grad", grid.grad[0], [1.0, 1.0])


def test_dropout_mask():
    x = Tensor([[1.0, 2.0], [3.0, 4.0]], requires_grad=True)
    mask = np.array([[1.0, 0.0], [1.0, 1.0]])
    layer = mt.nn.Dropout(0.5)
    layer.train()
    finite("dropout", lambda: layer(x, mask).sum(), [x])
    x.grad = None
    layer(x, mask).sum().backward()
    check("dropout grad", x.grad, [[2.0, 0.0], [2.0, 2.0]])
    layer.eval()
    same = layer(x, np.zeros_like(mask))
    check("dropout eval", same.data, x.data)


def test_optimizers():
    p = Tensor([1.0], requires_grad=True)
    p.grad = np.array([0.5])
    mt.optim.SGD([p], lr=0.1, weight_decay=0.2).step()
    check("sgd decay", p.data, [0.93])

    p = Tensor([1.0], requires_grad=True)
    p.grad = np.array([0.5])
    mt.optim.Momentum([p], lr=0.1, momentum=0.5).step()
    check("momentum", p.data, [0.95])

    p = Tensor([1.0], requires_grad=True)
    p.grad = np.array([0.5])
    mt.optim.AdaGrad([p], lr=0.1).step()
    check("adagrad", p.data, [0.9])

    p = Tensor([1.0], requires_grad=True)
    p.grad = np.array([0.5])
    mt.optim.RMSProp([p], lr=0.1, rho=0.0).step()
    check("rmsprop", p.data, [0.9])

    p = Tensor([1.0], requires_grad=True)
    p.grad = np.array([0.5])
    mt.optim.Adadelta([p], lr=1.0, rho=0.9, eps=1e-6).step()
    # sqrt(eps) / sqrt(0.1 * 0.25 + eps) * grad
    expect = 1.0 - (np.sqrt(1e-6) / np.sqrt(0.025 + 1e-6) * 0.5)
    check("adadelta", p.data, [expect], tol=1e-9)

    p = Tensor([1.0], requires_grad=True)
    p.grad = np.array([0.4])
    mt.optim.Adam([p], lr=0.01, betas=(0.9, 0.999), eps=1e-8).step()
    check("adam bias", p.data, [0.99], tol=1e-8)

    p = Tensor([1.0], requires_grad=True)
    opt = mt.optim.SGD([p], lr=0.2)
    sched = mt.optim.StepLR(opt, step_size=2, gamma=0.5)
    p.grad = np.array([1.0])
    opt.step()
    sched.step()
    p.grad = np.array([1.0])
    opt.step()
    sched.step()
    if abs(opt.lr - 0.1) > 1e-12:
        raise SystemExit(f"step lr {opt.lr}")


def test_fashion_steps():
    root = Path(__file__).resolve().parents[1] / "wasm" / "pyodide"
    x, y, xt, yt = mt.datasets.fashion_mnist(32, 8, path=str(root / "fashion-mnist.bin"))
    if x.shape != (32, 784) or x.dtype != np.uint8 or yt.shape != (8,):
        raise SystemExit(f"fashion shape {x.shape} {x.dtype} {yt.shape}")
    batch = mt.datasets.scale_batch(x[:4])
    if batch.shape != (4, 784) or float(batch.max()) > 1.0:
        raise SystemExit(f"batch {batch.shape} {batch.max()}")
    hx, hy, vx, vy = mt.datasets.house_prices(path=str(root / "house-tiny.csv"))
    if hx.shape[0] != 16 or vx.shape[0] != 8 or hx.shape[1] < 2:
        raise SystemExit(f"house {hx.shape} {vx.shape}")
    ax, ay = mt.datasets.airfoil(path=str(root / "airfoil-tiny.csv"))
    if ax.shape != (32, 5) or ay.shape != (32,):
        raise SystemExit(f"airfoil {ax.shape} {ay.shape}")
    np.random.seed(2)
    model = mt.nn.Sequential(mt.nn.Linear(784, 16), mt.nn.ReLU(), mt.nn.Linear(16, 10))
    opt = mt.optim.Adam(model.parameters(), lr=0.01)
    opt.zero_grad()
    loss = cross_entropy(model(Tensor(batch)), y[:4])
    loss.backward()
    opt.step()
    logits = model(Tensor(mt.datasets.scale_batch(xt)))
    acc = mt.accuracy(logits, yt)
    print(f"loss {float(loss.data):.4f}")
    print(f"acc {acc:.3f}")


def finite_map(value, apply):
    base = value.data.copy()
    analytic = None
    eps = 1e-5
    numeric = np.zeros_like(base)
    for index in np.ndindex(base.shape):
        value.data[index] = base[index] + eps
        plus = apply()
        value.data[index] = base[index] - eps
        minus = apply()
        value.data[index] = base[index]
        numeric[index] = (plus - minus) / (2 * eps)
    return numeric


def test_conv_pool_norm():
    x = mt.tensor(np.arange(9, dtype=np.float64).reshape(1, 1, 3, 3), requires_grad=True)
    weight = mt.tensor(np.array([[[[0.0, 1.0], [2.0, 3.0]]]]), requires_grad=True)
    bias = mt.tensor([0.0], requires_grad=True)
    out = mt.conv2d(x, weight, bias)
    check("corr", out.data.reshape(2, 2), [[19, 25], [37, 43]])
    out.sum().backward()
    numeric = finite_map(x, lambda: mt.conv2d(x, weight, bias).data.sum())
    check("conv x", x.grad, numeric, tol=1e-4)
    x.grad = None
    weight.grad = None
    bias.grad = None
    again = mt.conv2d(x, weight, bias)
    again.sum().backward()
    numeric_w = finite_map(weight, lambda: mt.conv2d(x, weight, bias).data.sum())
    check("conv w", weight.grad, numeric_w, tol=1e-4)
    numeric_b = finite_map(bias, lambda: mt.conv2d(x, weight, bias).data.sum())
    check("conv b", bias.grad, numeric_b, tol=1e-4)

    padded = mt.nn.Conv2d(1, 1, 3, padding=1, stride=2, bias=False)
    padded.weight.data[:] = 0
    padded.weight.data[0, 0, 1, 1] = 1
    image = mt.tensor(np.arange(16, dtype=np.float64).reshape(1, 1, 4, 4))
    pooled = padded(image)
    if pooled.shape != (1, 1, 2, 2):
        raise SystemExit(f"stride shape {pooled.shape}")

    grid = mt.tensor(np.arange(16, dtype=np.float64).reshape(1, 1, 4, 4), requires_grad=True)
    pooled = mt.nn.MaxPool2d(2, stride=2)(grid)
    check("maxpool", pooled.data.reshape(2, 2), [[5, 7], [13, 15]])
    pooled.sum().backward()
    numeric = finite_map(grid, lambda: mt.nn.MaxPool2d(2, stride=2)(grid).data.sum())
    check("maxpool grad", grid.grad, numeric, tol=1e-4)

    grid.grad = None
    averaged = mt.nn.AvgPool2d(2, stride=2)(grid)
    check("avgpool", averaged.data.reshape(2, 2), [[2.5, 4.5], [10.5, 12.5]])
    averaged.sum().backward()
    numeric = finite_map(grid, lambda: mt.nn.AvgPool2d(2, stride=2)(grid).data.sum())
    check("avgpool grad", grid.grad, numeric, tol=1e-4)

    raw = mt.tensor([[1.0, 2.0], [3.0, 4.0]], requires_grad=True)
    norm = mt.nn.BatchNorm(2)
    normed = norm(raw)
    check("bn", normed.data, [[-1.0, -1.0], [1.0, 1.0]], tol=1e-4)
    normed.sum().backward()
    numeric = finite_map(raw, lambda: mt.nn.BatchNorm(2)(raw).data.sum())
    # A fresh BatchNorm has gamma 1 and beta 0, matching the module after one forward's gamma.
    check("bn x", raw.grad, numeric, tol=1e-4)

    sig = mt.tensor([-2.0, 0.0, 2.0], requires_grad=True)
    sig.sigmoid().sum().backward()
    numeric = finite_map(sig, lambda: sig.sigmoid().data.sum())
    check("sigmoid", sig.grad, numeric, tol=1e-4)

    left = mt.tensor([[1.0, 2.0]], requires_grad=True)
    right = mt.tensor([[3.0]], requires_grad=True)
    joined = mt.cat([left, right], axis=1)
    check("cat", joined.data, [[1.0, 2.0, 3.0]])
    joined.sum().backward()
    check("cat left", left.grad, [[1.0, 1.0]])
    check("cat right", right.grad, [[1.0]])


def test_lenet_seconds():
    import time

    np.random.seed(0)
    root = Path(__file__).resolve().parents[1] / "wasm" / "pyodide"
    images, labels, _, _ = mt.datasets.fashion_mnist(32, 8, path=str(root / "fashion-mnist.bin"))
    net = mt.nn.Sequential(
        mt.nn.Conv2d(1, 6, 5, padding=2),
        mt.nn.Sigmoid(),
        mt.nn.AvgPool2d(2, stride=2),
        mt.nn.Conv2d(6, 16, 5),
        mt.nn.Sigmoid(),
        mt.nn.AvgPool2d(2, stride=2),
        mt.nn.Flatten(),
        mt.nn.Linear(400, 120),
        mt.nn.Sigmoid(),
        mt.nn.Linear(120, 84),
        mt.nn.Sigmoid(),
        mt.nn.Linear(84, 10),
    )
    opt = mt.optim.SGD(net.parameters(), lr=0.1)
    started = time.perf_counter()
    last = 0.0
    for step in range(4):
        opt.zero_grad()
        batch = mt.datasets.scale_batch(images[step * 4 : (step + 1) * 4]).reshape(4, 1, 28, 28)
        loss = cross_entropy(net(mt.tensor(batch)), labels[step * 4 : (step + 1) * 4])
        loss.backward()
        opt.step()
        last = float(loss.data)
    elapsed = time.perf_counter() - started
    if not np.isfinite(last):
        raise SystemExit("lenet loss is not finite")
    print(f"lenet loss {last:.4f} seconds {elapsed:.3f}")


if __name__ == "__main__":
    test_square()
    test_bias_broadcast()
    test_linear_finite()
    test_cross_entropy()
    test_xor()
    test_exp_log_index()
    test_dropout_mask()
    test_optimizers()
    test_fashion_steps()
    test_conv_pool_norm()
    test_lenet_seconds()
    print("minitorch ok")

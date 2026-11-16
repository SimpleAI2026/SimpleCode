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


def test_sequence_attention():
    np.random.seed(2)
    x = Tensor(np.random.randn(2, 3), requires_grad=True)
    finite("tanh", lambda: x.tanh().sum(), [x])
    finite("div", lambda: (x / 2.0).sum(), [x])
    denom = Tensor(np.array([2.0, 4.0]), requires_grad=True)
    finite("rdiv", lambda: (8.0 / denom).sum(), [denom])

    np.random.seed(3)
    emb = mt.nn.Embedding(5, 3)
    idx = np.array([[0, 1], [0, 4]])
    finite("embed", lambda: emb(idx).sum(), [emb.weight])

    np.random.seed(4)
    rnn = mt.nn.RNN(3, 4)
    seq = Tensor(np.random.randn(2, 3, 3))
    finite("rnn ih", lambda: rnn(seq)[0].sum(), [rnn.weight_ih])
    finite("rnn hh", lambda: rnn(seq)[0].sum(), [rnn.weight_hh, rnn.bias])

    np.random.seed(5)
    gru = mt.nn.GRU(3, 2)
    gseq = Tensor(np.random.randn(2, 2, 3))
    finite("gru", lambda: gru(gseq)[0].sum(), [gru.weight_hn, gru.bias_z])

    np.random.seed(6)
    lstm = mt.nn.LSTM(3, 2)
    lseq = Tensor(np.random.randn(2, 2, 3))
    finite("lstm", lambda: lstm(lseq)[0].sum(), [lstm.weight_if, lstm.bias_o])

    q = Tensor(np.random.randn(2, 3, 4), requires_grad=True)
    k = Tensor(np.random.randn(2, 3, 4), requires_grad=True)
    v = Tensor(np.random.randn(2, 3, 4), requires_grad=True)
    finite("attn q", lambda: mt.dot_attention(q, k, v)[0].sum(), [q])
    finite("attn v", lambda: mt.dot_attention(q, k, v)[0].sum(), [v])

    np.random.seed(7)
    mha = mt.nn.MultiHeadAttention(8, 2)
    src = Tensor(np.random.randn(2, 3, 8))
    finite("mha", lambda: mha(src, src, src).sum(), [mha.w_q.weight, mha.w_o.bias])

    np.random.seed(8)
    norm = mt.nn.LayerNorm(4)
    nx = Tensor(np.random.randn(2, 3, 4))
    finite("ln", lambda: norm(nx).sum(), [norm.weight, norm.bias])

    pe = mt.positional_encoding(4, 6)
    check("pe00", pe[0, 0], 0.0, tol=1e-8)
    check("pe01", pe[0, 1], 1.0, tol=1e-8)

    big = Tensor(np.ones(4), requires_grad=True)
    (big * big).sum().backward()
    norm_out = mt.clip_grad([big], 2.0)
    if abs(norm_out - 4.0) > 1e-6:
        raise SystemExit(f"clip norm {norm_out}")
    check("clip", big.grad, np.ones(4), tol=1e-5)

    timed = Tensor(np.arange(6, dtype=np.float64).reshape(1, 3, 2), requires_grad=True)
    finite("flip", lambda: mt.flip_time(timed).sum(), [timed])
    weights = mt.softmax_last(Tensor([[1.0, 1.0, 1.0]]))
    check("softmax row", weights.data.sum(), 1.0, tol=1e-8)


def test_text_samples():
    root = Path(__file__).resolve().parents[1] / "wasm" / "pyodide"
    text = mt.datasets.time_machine(path=str(root / "timemachine.txt"))
    if not (256 <= len(text) <= 8192):
        raise SystemExit(f"time machine bytes {len(text)}")
    train, val = mt.datasets.translation_pairs(path=str(root / "fra-eng.txt"))
    if len(train) != 16 or len(val) != 8:
        raise SystemExit("pair counts")
    for eng, fra in train + val:
        if len(eng.split()) != 4 or len(fra.split()) != 4:
            raise SystemExit(f"pair width {eng} | {fra}")


def test_vision_ops():
    np.random.seed(0)
    x = Tensor(np.random.randn(2, 1, 3, 3), requires_grad=True)
    layer = mt.nn.ConvTranspose2d(1, 2, 2, stride=1, padding=0)
    finite("deconv x", lambda: layer(x).sum(), [x])
    finite("deconv w", lambda: layer(x).sum(), [layer.weight, layer.bias])
    y = layer(x)
    check("deconv shape", np.array(y.shape), np.array([2, 2, 4, 4]))

    small = Tensor(np.arange(8, dtype=np.float64).reshape(1, 1, 2, 4), requires_grad=True)
    finite("bilinear", lambda: mt.upsample_bilinear(small, (4, 8)).sum(), [small])

    feat = Tensor(np.random.randn(1, 2, 6, 6), requires_grad=True)
    boxes = np.array([[0, 0, 0, 4, 4], [0, 2, 1, 6, 5]], dtype=np.float64)
    finite("roi", lambda: mt.roi_pool(feat, boxes, 2).sum(), [feat])

    iou = mt.box_iou([[0, 0, 2, 2]], [[0, 0, 2, 2], [1, 1, 3, 3]])
    check("iou self", iou[0, 0], 1.0)
    check("iou overlap", iou[0, 1], 1.0 / 7.0, tol=1e-8)
    anchors = mt.multibox_prior(2, 2, [0.5], [1.0, 2.0])
    check("anchor count", np.array([anchors.shape[0]]), np.array([8]))
    kept = mt.nms([[0, 0, 2, 2], [0.1, 0.1, 2.1, 2.1], [5, 5, 6, 6]], [0.2, 0.9, 0.4], 0.5)
    check("nms", kept, np.array([1, 2]))

    train_x, train_y, val_x, val_y = mt.datasets.finetune_images()
    if train_x.shape != (4, 1, 32, 32) or val_x.shape[0] != 4:
        raise SystemExit(f"finetune {train_x.shape}")
    det_x, det_box, _, _, _, _ = mt.datasets.detect_images()
    if det_x.shape != (8, 1, 32, 32) or det_box.shape != (8, 4):
        raise SystemExit("detect shape")
    seg_x, seg_y = mt.datasets.segment_images()
    if seg_x.shape != (4, 1, 32, 32) or seg_y.shape != (4, 32, 32):
        raise SystemExit("segment shape")
    cifar_x, cifar_y, cifar_vx, _ = mt.datasets.cifar_images()
    if cifar_x.shape != (16, 3, 32, 32) or cifar_vx.shape[0] != 4:
        raise SystemExit("cifar shape")
    dog_x, dog_y, dog_vx, _ = mt.datasets.dog_images()
    if dog_x.shape != (8, 3, 32, 32) or dog_vx.shape[0] != 2:
        raise SystemExit("dog shape")
    if int(train_y.sum() + val_y.sum() + cifar_y.sum() + dog_y.sum()) < 0:
        raise SystemExit("labels")


def test_nlp_ops():
    np.random.seed(0)
    logits = Tensor(np.array([0.2, -0.4, 1.1, 0.0]), requires_grad=True)
    finite("bce", lambda: mt.bce_with_logits(logits, np.array([1.0, 0.0, 1.0, 0.0])), [logits])
    x = Tensor(np.random.randn(2, 3, 8), requires_grad=True)
    block = mt.nn.EncoderBlock(8, 2, 16)
    finite("encoder x", lambda: block(x).sum(), [x])
    finite("encoder ff", lambda: block(x).sum(), [block.ff1.weight, block.ff2.bias])
    train, val = mt.embed_lines()
    if len(train) != 32 or len(val) != 8:
        raise SystemExit("embed lines")
    excerpt = mt.bpe_excerpt()
    merges, _words = mt.bpe_merges(excerpt, 4)
    if len(excerpt.encode("utf-8")) != 1852 or len(merges) != 4 or merges[0] != ("e", "</w>"):
        raise SystemExit(f"bpe {len(excerpt.encode())} {merges[:1]}")
    if len(mt.bert_segments()) != 4:
        raise SystemExit("bert segments")
    texts, labels, held, held_y = mt.sentiment_reviews()
    if len(texts) != 8 or len(held) != 4 or int(labels.sum()) != 4:
        raise SystemExit("sentiment")
    left, _right, y, vleft, _vright, _vy = mt.nli_pairs()
    if len(left) != 8 or len(vleft) != 4 or int(y[0]) != 0:
        raise SystemExit("nli")
    if held_y.shape[0] != 4:
        raise SystemExit("held")


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
    test_sequence_attention()
    test_text_samples()
    test_vision_ops()
    test_nlp_ops()
    test_lenet_seconds()
    print("minitorch ok")

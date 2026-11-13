// DeepLearning section order for docs/dl and docs/en/dl.
//
// Order follows d2l-zh release 2.0.0 at commit
// e6b18ccea71451a55fcd861d7b96fddf2587b09a: root index.md, then each
// chapter index toctree. *_origin.md and chapter_references/ are omitted.
// Chapter numbers are indexes in DL_TOC, including chapter 0.
// DL_LANDED_PHASE is the last phase whose markdown must exist.
// Later phases add files; they do not renumber earlier chapters.
// Sample bytes, once phase 3 replaces the Fashion-MNIST subset, stay
// within DL_SAMPLE_BUDGET_BYTES. This phase vendors no new samples.

export const DL_ZH_COMMIT = "e6b18ccea71451a55fcd861d7b96fddf2587b09a";
export const DL_EN_COMMIT = "23d7a5aecceee57d1292c56e90cce307f183bb0a";

/** Last curriculum phase whose chapters are required on disk. */
export const DL_LANDED_PHASE = 2;

/** Combined cap for tiny DeepLearning samples. Not a download of upstream archives. */
export const DL_SAMPLE_BUDGET_BYTES = 256 * 1024;

export type DlTier = "full" | "reduced" | "readonly";

export interface DlSection {
  path: string;
  tier: DlTier;
  phase: 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export const DL_TOC: readonly DlSection[] = [
  { path: "chapter_preface/index.md", tier: "readonly", phase: 2 },
  { path: "chapter_installation/index.md", tier: "readonly", phase: 2 },
  { path: "chapter_notation/index.md", tier: "readonly", phase: 2 },
  { path: "chapter_introduction/index.md", tier: "readonly", phase: 2 },
  { path: "chapter_preliminaries/index.md", tier: "readonly", phase: 3 },
  { path: "chapter_preliminaries/ndarray.md", tier: "full", phase: 3 },
  { path: "chapter_preliminaries/pandas.md", tier: "reduced", phase: 3 },
  { path: "chapter_preliminaries/linear-algebra.md", tier: "full", phase: 3 },
  { path: "chapter_preliminaries/calculus.md", tier: "full", phase: 3 },
  { path: "chapter_preliminaries/autograd.md", tier: "full", phase: 3 },
  { path: "chapter_preliminaries/probability.md", tier: "full", phase: 3 },
  { path: "chapter_preliminaries/lookup-api.md", tier: "reduced", phase: 3 },
  { path: "chapter_linear-networks/index.md", tier: "readonly", phase: 3 },
  { path: "chapter_linear-networks/linear-regression.md", tier: "full", phase: 3 },
  { path: "chapter_linear-networks/linear-regression-scratch.md", tier: "full", phase: 3 },
  { path: "chapter_linear-networks/linear-regression-concise.md", tier: "full", phase: 3 },
  { path: "chapter_linear-networks/softmax-regression.md", tier: "full", phase: 3 },
  { path: "chapter_linear-networks/image-classification-dataset.md", tier: "reduced", phase: 3 },
  { path: "chapter_linear-networks/softmax-regression-scratch.md", tier: "reduced", phase: 3 },
  { path: "chapter_linear-networks/softmax-regression-concise.md", tier: "reduced", phase: 3 },
  { path: "chapter_multilayer-perceptrons/index.md", tier: "readonly", phase: 3 },
  { path: "chapter_multilayer-perceptrons/mlp.md", tier: "full", phase: 3 },
  { path: "chapter_multilayer-perceptrons/mlp-scratch.md", tier: "reduced", phase: 3 },
  { path: "chapter_multilayer-perceptrons/mlp-concise.md", tier: "reduced", phase: 3 },
  { path: "chapter_multilayer-perceptrons/underfit-overfit.md", tier: "full", phase: 3 },
  { path: "chapter_multilayer-perceptrons/weight-decay.md", tier: "full", phase: 3 },
  { path: "chapter_multilayer-perceptrons/dropout.md", tier: "full", phase: 3 },
  { path: "chapter_multilayer-perceptrons/backprop.md", tier: "full", phase: 3 },
  { path: "chapter_multilayer-perceptrons/numerical-stability-and-init.md", tier: "full", phase: 3 },
  { path: "chapter_multilayer-perceptrons/environment.md", tier: "full", phase: 3 },
  { path: "chapter_multilayer-perceptrons/kaggle-house-price.md", tier: "reduced", phase: 3 },
  { path: "chapter_deep-learning-computation/index.md", tier: "readonly", phase: 4 },
  { path: "chapter_deep-learning-computation/model-construction.md", tier: "full", phase: 4 },
  { path: "chapter_deep-learning-computation/parameters.md", tier: "full", phase: 4 },
  { path: "chapter_deep-learning-computation/deferred-init.md", tier: "reduced", phase: 4 },
  { path: "chapter_deep-learning-computation/custom-layer.md", tier: "full", phase: 4 },
  { path: "chapter_deep-learning-computation/read-write.md", tier: "full", phase: 4 },
  { path: "chapter_deep-learning-computation/use-gpu.md", tier: "readonly", phase: 4 },
  { path: "chapter_convolutional-neural-networks/index.md", tier: "readonly", phase: 4 },
  { path: "chapter_convolutional-neural-networks/why-conv.md", tier: "full", phase: 4 },
  { path: "chapter_convolutional-neural-networks/conv-layer.md", tier: "full", phase: 4 },
  { path: "chapter_convolutional-neural-networks/padding-and-strides.md", tier: "full", phase: 4 },
  { path: "chapter_convolutional-neural-networks/channels.md", tier: "full", phase: 4 },
  { path: "chapter_convolutional-neural-networks/pooling.md", tier: "full", phase: 4 },
  { path: "chapter_convolutional-neural-networks/lenet.md", tier: "reduced", phase: 4 },
  { path: "chapter_convolutional-modern/index.md", tier: "readonly", phase: 4 },
  { path: "chapter_convolutional-modern/alexnet.md", tier: "reduced", phase: 4 },
  { path: "chapter_convolutional-modern/vgg.md", tier: "reduced", phase: 4 },
  { path: "chapter_convolutional-modern/nin.md", tier: "reduced", phase: 4 },
  { path: "chapter_convolutional-modern/googlenet.md", tier: "reduced", phase: 4 },
  { path: "chapter_convolutional-modern/batch-norm.md", tier: "reduced", phase: 4 },
  { path: "chapter_convolutional-modern/resnet.md", tier: "reduced", phase: 4 },
  { path: "chapter_convolutional-modern/densenet.md", tier: "reduced", phase: 4 },
  { path: "chapter_recurrent-neural-networks/index.md", tier: "readonly", phase: 5 },
  { path: "chapter_recurrent-neural-networks/sequence.md", tier: "full", phase: 5 },
  { path: "chapter_recurrent-neural-networks/text-preprocessing.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-neural-networks/language-models-and-dataset.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-neural-networks/rnn.md", tier: "full", phase: 5 },
  { path: "chapter_recurrent-neural-networks/rnn-scratch.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-neural-networks/rnn-concise.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-neural-networks/bptt.md", tier: "full", phase: 5 },
  { path: "chapter_recurrent-modern/index.md", tier: "readonly", phase: 5 },
  { path: "chapter_recurrent-modern/gru.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-modern/lstm.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-modern/deep-rnn.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-modern/bi-rnn.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-modern/machine-translation-and-dataset.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-modern/encoder-decoder.md", tier: "full", phase: 5 },
  { path: "chapter_recurrent-modern/seq2seq.md", tier: "reduced", phase: 5 },
  { path: "chapter_recurrent-modern/beam-search.md", tier: "full", phase: 5 },
  { path: "chapter_attention-mechanisms/index.md", tier: "readonly", phase: 5 },
  { path: "chapter_attention-mechanisms/attention-cues.md", tier: "readonly", phase: 5 },
  { path: "chapter_attention-mechanisms/nadaraya-waston.md", tier: "full", phase: 5 },
  { path: "chapter_attention-mechanisms/attention-scoring-functions.md", tier: "full", phase: 5 },
  { path: "chapter_attention-mechanisms/bahdanau-attention.md", tier: "reduced", phase: 5 },
  { path: "chapter_attention-mechanisms/multihead-attention.md", tier: "full", phase: 5 },
  { path: "chapter_attention-mechanisms/self-attention-and-positional-encoding.md", tier: "full", phase: 5 },
  { path: "chapter_attention-mechanisms/transformer.md", tier: "reduced", phase: 5 },
  { path: "chapter_optimization/index.md", tier: "readonly", phase: 3 },
  { path: "chapter_optimization/optimization-intro.md", tier: "readonly", phase: 3 },
  { path: "chapter_optimization/convexity.md", tier: "full", phase: 3 },
  { path: "chapter_optimization/gd.md", tier: "full", phase: 3 },
  { path: "chapter_optimization/sgd.md", tier: "full", phase: 3 },
  { path: "chapter_optimization/minibatch-sgd.md", tier: "reduced", phase: 3 },
  { path: "chapter_optimization/momentum.md", tier: "full", phase: 3 },
  { path: "chapter_optimization/adagrad.md", tier: "full", phase: 3 },
  { path: "chapter_optimization/rmsprop.md", tier: "full", phase: 3 },
  { path: "chapter_optimization/adadelta.md", tier: "full", phase: 3 },
  { path: "chapter_optimization/adam.md", tier: "full", phase: 3 },
  { path: "chapter_optimization/lr-scheduler.md", tier: "full", phase: 3 },
  { path: "chapter_computational-performance/index.md", tier: "readonly", phase: 8 },
  { path: "chapter_computational-performance/hybridize.md", tier: "readonly", phase: 8 },
  { path: "chapter_computational-performance/async-computation.md", tier: "readonly", phase: 8 },
  { path: "chapter_computational-performance/auto-parallelism.md", tier: "readonly", phase: 8 },
  { path: "chapter_computational-performance/hardware.md", tier: "readonly", phase: 8 },
  { path: "chapter_computational-performance/multiple-gpus.md", tier: "readonly", phase: 8 },
  { path: "chapter_computational-performance/multiple-gpus-concise.md", tier: "readonly", phase: 8 },
  { path: "chapter_computational-performance/parameterserver.md", tier: "readonly", phase: 8 },
  { path: "chapter_computer-vision/index.md", tier: "readonly", phase: 6 },
  { path: "chapter_computer-vision/image-augmentation.md", tier: "reduced", phase: 6 },
  { path: "chapter_computer-vision/fine-tuning.md", tier: "reduced", phase: 6 },
  { path: "chapter_computer-vision/bounding-box.md", tier: "full", phase: 6 },
  { path: "chapter_computer-vision/anchor.md", tier: "full", phase: 6 },
  { path: "chapter_computer-vision/multiscale-object-detection.md", tier: "full", phase: 6 },
  { path: "chapter_computer-vision/object-detection-dataset.md", tier: "reduced", phase: 6 },
  { path: "chapter_computer-vision/ssd.md", tier: "reduced", phase: 6 },
  { path: "chapter_computer-vision/rcnn.md", tier: "reduced", phase: 6 },
  { path: "chapter_computer-vision/semantic-segmentation-and-dataset.md", tier: "reduced", phase: 6 },
  { path: "chapter_computer-vision/transposed-conv.md", tier: "full", phase: 6 },
  { path: "chapter_computer-vision/fcn.md", tier: "reduced", phase: 6 },
  { path: "chapter_computer-vision/neural-style.md", tier: "reduced", phase: 6 },
  { path: "chapter_computer-vision/kaggle-cifar10.md", tier: "reduced", phase: 6 },
  { path: "chapter_computer-vision/kaggle-dog.md", tier: "reduced", phase: 6 },
  { path: "chapter_natural-language-processing-pretraining/index.md", tier: "readonly", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/word2vec.md", tier: "full", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/approx-training.md", tier: "full", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/word-embedding-dataset.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/word2vec-pretraining.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/glove.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/subword-embedding.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/similarity-analogy.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/bert.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/bert-dataset.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-pretraining/bert-pretraining.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-applications/index.md", tier: "readonly", phase: 7 },
  { path: "chapter_natural-language-processing-applications/sentiment-analysis-and-dataset.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-applications/sentiment-analysis-rnn.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-applications/sentiment-analysis-cnn.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-applications/natural-language-inference-and-dataset.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-applications/natural-language-inference-attention.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-applications/finetuning-bert.md", tier: "reduced", phase: 7 },
  { path: "chapter_natural-language-processing-applications/natural-language-inference-bert.md", tier: "reduced", phase: 7 },
  { path: "chapter_appendix-tools-for-deep-learning/index.md", tier: "readonly", phase: 8 },
  { path: "chapter_appendix-tools-for-deep-learning/jupyter.md", tier: "readonly", phase: 8 },
  { path: "chapter_appendix-tools-for-deep-learning/sagemaker.md", tier: "readonly", phase: 8 },
  { path: "chapter_appendix-tools-for-deep-learning/aws.md", tier: "readonly", phase: 8 },
  { path: "chapter_appendix-tools-for-deep-learning/selecting-servers-gpus.md", tier: "readonly", phase: 8 },
  { path: "chapter_appendix-tools-for-deep-learning/contributing.md", tier: "readonly", phase: 8 },
  { path: "chapter_appendix-tools-for-deep-learning/d2l.md", tier: "readonly", phase: 8 },
];

const byPath = new Map(DL_TOC.map((section, index) => [section.path, index]));

export function dlChapterNumber(path: string): number | undefined {
  return byPath.get(path);
}

export function dlSlug(path: string): string {
  return path.endsWith(".md") ? path.slice(0, -3) : path;
}

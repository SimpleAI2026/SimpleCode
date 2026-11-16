// NumPy and DeepLearning are separate sidebar rows. They share one Pyodide
// download and one worker. Each drawer opens a single book.
import { BOOK_TO_RUNTIME, RUNTIME_BOOKS, RUNTIME_TO_BOOK } from "../../src/docs/runtime.ts";

export function pyodideBookErrors(): string[] {
  const errors: string[] = [];
  const dlChoices = RUNTIME_BOOKS.numpy ?? [];
  const npChoices = RUNTIME_BOOKS.np ?? [];
  if (dlChoices.length !== 1 || dlChoices[0] !== "dl") errors.push("DeepLearning 抽屉只应打开 dl");
  if (npChoices.length !== 1 || npChoices[0] !== "numpy") errors.push("NumPy 抽屉只应打开 numpy");
  if (dlChoices.includes("numpy")) errors.push("DeepLearning 抽屉不应再列出 NumPy 书");
  if (npChoices.includes("dl")) errors.push("NumPy 抽屉不应再列出 DeepLearning 书");
  if (RUNTIME_TO_BOOK.numpy !== "dl") errors.push("DeepLearning 侧栏应打开 dl");
  if (RUNTIME_TO_BOOK.np !== "numpy") errors.push("NumPy 侧栏应打开 numpy");
  if (BOOK_TO_RUNTIME.dl !== "numpy") errors.push("dl 书应在 DeepLearning 运行时执行");
  if (BOOK_TO_RUNTIME.numpy !== "np") errors.push("numpy 书应在 NumPy 运行时执行");
  return errors;
}

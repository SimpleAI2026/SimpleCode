export interface LocaleSample {
  zh: string;
  en: string;
}

function pair(zh: string, en: string, body: string): LocaleSample {
  return { zh: `${zh}\n${body}`, en: `${en}\n${body}` };
}

export const sampleLocales: Record<string, LocaleSample> = {
  python: pair(
    "# 读入名字，再打印 1 到 5 的平方",
    "# Read a name, then print squares from 1 to 5",
    `name = input("What's your name? ")
print(f"Hello, {name}!")

squares = [n * n for n in range(1, 6)]
print("Squares:", squares)
`,
  ),
  ruby: pair(
    "# 读入名字，再打印 1 到 5 的平方",
    "# Read a name, then print squares from 1 to 5",
    `print "What's your name? "
name = gets.to_s.strip
puts "Hello, #{name}!"

puts (1..5).map { |n| n * n }.inspect
`,
  ),
  "quickjs:js": pair(
    "// 斐波那契，以及把数组里的数加倍",
    "// Fibonacci, then double each array value",
    `const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));

console.log("Hello from JS!");
console.log("fib(20) =", fib(20));
console.log([1, 2, 3].map((x) => x * 2));
`,
  ),
  "quickjs:ts": pair(
    "// 带类型的问候和斐波那契",
    "// A typed greeting and Fibonacci",
    `interface Greeting {
  name: string;
  n: number;
}

function fib(n: number): number {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

const hello: Greeting = { name: "TypeScript", n: 20 };
console.log(\`Hello from \${hello.name}!\`);
console.log("fib(20) =", fib(hello.n));
`,
  ),
  sqlite: pair(
    "-- 建一张用户表，再查出年龄大于 30 的人",
    "-- Create a user table and list people older than 30",
    `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);
INSERT INTO users (name, age) VALUES ('Ada', 36), ('Linus', 28), ('Grace', 45);

.mode box
SELECT name, age FROM users WHERE age > 30 ORDER BY age DESC;
`,
  ),
  clang: pair(
    "/* 读入名字并问候 */",
    "/* Read a name and greet them */",
    `#include <stdio.h>

int main(void) {
    char name[64];
    printf("What's your name? ");
    fflush(stdout);
    if (scanf("%63s", name) == 1) {
        printf("Hello, %s!\\n", name);
    }
    return 0;
}
`,
  ),
  clangpp: pair(
    "// 向三种语言问好",
    "// Greet three languages",
    `#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> langs = {"Python", "Ruby", "C++"};
    for (const auto& l : langs) {
        std::cout << "Hello, " << l << "!" << std::endl;
    }
    return 0;
}
`,
  ),
  "php-cgi": pair(
    "// 问候，并打印 1 到 5 的平方",
    "// Greet, then print squares from 1 to 5",
    `<?php
$name = "World";
echo "Hello, $name!\\n";

$squares = array_map(fn($n) => $n * $n, range(1, 5));
echo implode(", ", $squares) . "\\n";
`,
  ),
  lua: pair(
    "-- 读入名字，打印平方，并接住一次错误",
    "-- Read a name, print squares, and catch one error",
    `io.write("What's your name? ")
io.flush()
local name = io.read("*l") or ""
print(string.format("Hello, %s!", name))

local squares = {}
for n = 1, 5 do
  squares[#squares + 1] = tostring(n * n)
end
print(table.concat(squares, ", "))

local ok, err = pcall(function() error("boom") end)
print(ok and "pcall missed the error" or ("pcall caught: " .. tostring(err)))
`,
  ),
  go: pair(
    "// 读入名字，再打印 1 到 5 的平方",
    "// Read a name, then print squares from 1 to 5",
    `package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	fmt.Print("What's your name? ")
	in := bufio.NewReader(os.Stdin)
	name, _ := in.ReadString('\\n')
	fmt.Printf("Hello, %s!\\n", strings.TrimSpace(name))

	squares := make([]int, 0, 5)
	for n := 1; n <= 5; n++ {
		squares = append(squares, n*n)
	}
	fmt.Println(squares)
}
`,
  ),
  java: pair(
    "// 读入一行名字",
    "// Read one line, then greet that name",
    `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        System.out.print("What's your name? ");
        String name = in.nextLine();
        System.out.println("Hello, " + name + "!");
    }
}
`,
  ),
  rust: pair(
    "// 把三个数加起来",
    "// Add three numbers",
    `fn main() {
    let values = vec![1, 2, 39];
    let sum: i32 = values.iter().sum();
    println!("Hello from Rust {sum}");
}
`,
  ),
  shell: pair(
    "# 读入名字，再走一遍内建管道和循环",
    "# Read a name, then try a builtin pipe and a loop",
    `printf "What's your name? "
read name
printf "Hello, %s!\\n" "$name"

echo "builtin pipe" | cat
echo "squares:"
for n in 1 2 3 4 5; do
  echo "$n"
done
`,
  ),
  numpy: pair(
    "# 用 NumPy 做点积，并读入一个乘数",
    "# Dot product with NumPy, then read a multiplier",
    `import numpy as np

left = np.array([1.0, 2.0, 3.0])
right = np.array([4.0, 5.0, 6.0])
print("dot", float(np.dot(left, right)))

scale = float(input())
print("scaled", float(np.dot(left, right) * scale))
`,
  ),
  linux: pair(
    "# 列出根目录的前几项，再留下匹配的那一行",
    "# List the first entries under /, then keep the matching line",
    `echo "Hello from Linux"
ls --color=never -1 / | head -n 4
printf '%s\\n' first second | grep second
`,
  ),
};

function sampleRecord(id: string) {
  return sampleLocales[id] ?? (id === "np" ? sampleLocales.numpy : undefined);
}

export function sampleFor(id: string, locale: "zh" | "en"): string {
  const sample = sampleRecord(id);
  if (!sample) return "";
  return locale === "en" ? sample.en : sample.zh;
}

export function isUntouchedSample(id: string, code: string): boolean {
  const sample = sampleRecord(id);
  if (!sample) return false;
  return code === sample.zh || code === sample.en;
}

export const samples: Record<string, string> = Object.fromEntries(
  Object.entries(sampleLocales).map(([id, sample]) => [id, sample.zh]),
);

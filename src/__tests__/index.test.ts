import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { doesFileMatch, normalisePath, findTodos, readTodos } from "../index";
import { Todo } from "../types";

describe("doesFileMatch given a valid file", () => {
  test("which wildcard in middle of pattern", () => {
    const file = "/c/service/src/index.ts";
    const patterns = ["service/*.ts"];

    const res = doesFileMatch(file, patterns);
    expect(res).toBeTruthy();
  });

  test("which wildcard at end of pattern", () => {
    const file = "/c/service/src/index.ts";
    const patterns = ["service/*"];

    const res = doesFileMatch(file, patterns);
    expect(res).toBeTruthy();
  });
});

test("doesFileMatch Given Invalid File", () => {
  const file = "/c/service/index.js";
  const patterns = ["service/*.ts"];

  const res = doesFileMatch(file, patterns);
  expect(res).toBeFalsy();
});

test("normalisePath given backslashes, rewrites to forward slashes", () => {
  const path = "C:\\service\\index.ts";
  const res = normalisePath(path);
  expect(res).toEqual("C:/service/index.ts");
});

test("findTodos recursively finds the correct files and todos", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "todo-tracker-"));
  await fs.mkdir(path.join(tempDir, "src"));
  await fs.writeFile(path.join(tempDir, "index.ts"), "hello world");
  await fs.writeFile(path.join(tempDir, "src/code.ts"), "hello world");
  await fs.writeFile(path.join(tempDir, "src/todo.ts"), "TODO: hello");

  try {
    const include = ["src/*.ts"];
    const todos: Todo[] = [];

    for await (let todo of findTodos(tempDir, include)) {
      todos.push(...todo);
    }

    expect(todos.length).toEqual(1);
    expect(todos[0].file).toContain("todo.ts");
    expect(todos[0].comment).toEqual("hello");
    expect(todos[0].startLine).toEqual(1);
    expect(todos[0].endLine).toEqual(1);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

describe("readTodos", () => {
  test("where no TODOs in given data", () => {
    const todos = readTodos("myFile.txt", "");
    expect(todos).toEqual([]);
  });

  test("where TODO is given", () => {
    const data = `// TODO: hello
                      // world
                      console.log("hello");`;

    const todos = readTodos("myFile.txt", data);

    expect(todos.length).toEqual(1);
    expect(todos[0].comment).toEqual("hello world");
    expect(todos[0].startLine).toEqual(1);
    expect(todos[0].endLine).toEqual(2);
  });
});

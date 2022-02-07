import * as fs from "fs/promises";
import * as path from "path";
import { Todo } from "./types";
import * as utils from "./utils";

/**
 * used to check if the file matches the given patterns.
 *
 * @param file the name of the file.
 * @param patterns the patterns the file must match.
 * @returns if the file matches one of the patterns.
 */
const doesFileMatch = (file: string, patterns: string[]): boolean => {
  patterns = patterns.map(p => {
    let idx = p.indexOf("*");
    while (idx > -1) {
      if (idx + 1 < p.length) {
        const nextChar = p[idx + 1];
        const regex = `([^${nextChar}]+)`;
        p = p.substring(0, idx) + regex + p.substring(idx + 1);
      } else {
        const regex = `(.*)`;
        p = p.substring(0, idx) + regex + p.substring(idx + 1);
      }
      idx = p.indexOf("*");
    }
    return p;
  });

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    if (file.match(pattern)) {
      return true;
    }
  }

  return false;
};

/**
 * reads through the given data for TODO comments, then returns the comment
 * and the lines the comment was on.
 *
 * @param baseDir the path of the base directory.
 * @param file the name of the file.
 * @param data the contents of a file.
 * @returns an array of TODOs in the file.
 */
export const readTodos = (
  baseDir: string,
  file: string,
  data: string
): Todo[] => {
  const todos: Todo[] = [];
  const lines = data.split("\n");
  let todo: Todo | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const todoIdx = line.indexOf("TODO:");
    if (todoIdx > -1) {
      todo = {
        file: utils.removeLeadingAndTrailingSlash(file.replace(baseDir, "")),
        comment: line.substring(todoIdx + 5).trim(),
        startLine: i + 1,
        endLine: i + 1,
      };
      todos.push(todo);
      continue;
    }

    if (!todo) {
      continue;
    }

    const commentIdx = line.indexOf("//");
    if (commentIdx > -1) {
      todo.comment += " " + line.substring(commentIdx).replace("//", "").trim();
      todo.endLine = i + 1;
    } else {
      todo = null;
    }
  }

  return todos;
};

/**
 * recurcively searches files in a given directory for TODO comments.
 *
 * @param dir the directory to search.
 * @param include patterns of files to include.
 * @returns an array of Todos.
 */
export const searchTodos = async (
  dir: string,
  include: string[]
): Promise<Todo[]> => {
  const todos: Todo[] = [];
  const files = await fs.readdir(dir);
  for (let i = 0; i < files.length; i++) {
    const file = utils.normalisePath(path.join(dir, files[i]));
    const stat = await fs.stat(file);
    if (stat.isFile()) {
      if (!doesFileMatch(file, include)) {
        continue;
      }
      const data = await fs.readFile(file, "utf8");
      if (!data.includes("TODO:")) {
        continue;
      }
      todos.push(...readTodos(dir, file, data));
    } else {
      todos.push(...(await searchTodos(file, include)));
    }
  }
  return [];
};

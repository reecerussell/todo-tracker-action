import { Octokit } from "@octokit/rest";
import * as JSum from "jsum";
import { Rule, Todo } from "./types";

interface Issue {
  id: number;
  title: string;
  body: string;
  labels?: string[];
}

const getIssues = async (
  token: string,
  owner: string,
  repo: string
): Promise<Issue[]> => {
  console.log("Fetching existing issues for " + owner + "/" + repo);
  const octokit = new Octokit({ auth: token });
  const response = await octokit.rest.issues.listForRepo({
    owner: owner,
    repo: repo,
  });
  return response.data.map(
    i =>
      ({
        id: i.id,
        title: i.title,
        body: i.body ?? i.body_html ?? i.body_text,
      } as Issue)
  );
};

export const createIssues = async (
  token: string,
  owner: string,
  repo: string,
  branch: string,
  todos: Todo[],
  rule: Rule
): Promise<void> => {
  const octokit = new Octokit({ auth: token });
  const issues = await getIssues(token, owner, repo);

  console.log(`Creating ${todos.length} issues...`);

  for (let todo of todos) {
    console.log("Creating issue for TODO found in: " + todo.file + "...");
    const sha = checksum(todo);
    if (issues.find(x => x.body?.includes(sha))) {
      console.log("Issue already exists, skipping.");
      continue;
    }

    const gistLink = `https://github.com/${owner}/${repo}/blob/${branch}/${todo.file}#L${todo.startLine}-L${todo.endLine}`;

    await octokit.rest.issues.create({
      owner: owner,
      repo: repo,
      title: formatTitle(rule.titleFormat, todo),
      labels: rule.labels,
      body: `This issue was automatically created after a TODO comment was found, in \`${todo.file.substring(
        todo.file.lastIndexOf("/") + 1
      )}\` (lines ${todo.startLine}-${
        todo.endLine
      }).\n\n${gistLink}\n\nsha256:${sha}`,
    });
  }
};

const checksum = (todo: Todo): string => {
  return JSum.digest(todo, "SHA256", "hex");
};

const formatTitle = (format: string, todo: Todo): string => {
  const file = todo.file.substring(todo.file.lastIndexOf("/") + 1);
  return format
    .replace("{FILE}", file)
    .replace("{COMMENT}", todo.comment.substring(0, 50));
};

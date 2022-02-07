import * as core from "@actions/core";
import * as config from "./config";
import * as utils from "./utils";
import { searchTodos } from "./todos";
import { createIssues } from "./issues";

const run = async (): Promise<void> => {
  const configFilePath = core.getInput("config-file");
  const token = core.getInput("github-token");
  const path = utils.normalisePath(core.getInput("path"));
  const owner = core.getInput("owner");
  const repo = core.getInput("repo");
  const ref = core.getInput("ref");

  const rules = config.getRules(configFilePath);
  for (let rule of rules) {
    const todos = await searchTodos(path, rule.include);
    await createIssues(token, owner, repo, ref, todos, rule);
  }
};

run()
  .then()
  .catch((error: Error) => core.setFailed(error.message));

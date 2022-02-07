import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { getRules } from "../config";

test("getRules", async () => {
  const data = `rules:
- titleFormat: "TODO: {FILE} - {COMMENT}"
  include:
    - "src/*.ts"
  labels:
    - "todo"`;

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "todo-tracker-"));
  const configFilePath = path.join(tempDir, "config.yaml");
  await fs.writeFile(configFilePath, data);

  try {
    const rules = getRules(configFilePath);

    expect(rules.length).toEqual(1);
    expect(rules[0].titleFormat).toEqual("TODO: {FILE} - {COMMENT}");
    expect(rules[0].include).toEqual(["src/*.ts"]);
    expect(rules[0].labels).toEqual(["todo"]);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

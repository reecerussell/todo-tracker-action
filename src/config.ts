import * as fs from "fs";
import * as yaml from "js-yaml";
import { Rule } from "./types";

/**
 * Represents the structure of the config file.
 */
interface Config {
  rules: Rule[];
}

/**
 * Used to fetch a list of pre-configured Rules from a config file.
 *
 * @param configFile the path to the config file.
 * @returns an array of rules from the config file.
 */
export const getRules = (configFile: string): Rule[] => {
  const data = fs.readFileSync(configFile, "utf8");
  const config = yaml.load(data);

  return (config as Config).rules;
};

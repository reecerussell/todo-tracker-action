/**
 * Defines information about a TODO comment found in code.
 */
export interface Todo {
  /**
   * The name of the file where the comment was found.
   */
  file: string;

  /**
   * The TODO comment.
   */
  comment: string;

  /**
   * The line in which the TODO starts on.
   */
  startLine: number;

  /**
   * The line in which the TODO ends on.
   */
  endLine: number;
}

/**
 * A Rule defines where to search for TODOs and contains issue information.
 */
export interface Rule {
  /**
   * File paths to include - '*' can be used as a wildcard.
   */
  include: string[];

  /**
   * Labels to attach to an issue.
   */
  labels: string[];

  /**
   * The format of the issue title.
   */
  titleFormat: string;
}

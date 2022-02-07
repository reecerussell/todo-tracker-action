export const normalisePath = (path: string): string => {
  while (path.indexOf("\\") > -1) {
    path = path.replace("\\", "/");
  }
  return path;
};

export const removeLeadingAndTrailingSlash = (str: string): string => {
  if (str[0] === "/") {
    str = str.substring(1);
  }
  if (str[str.length - 1] === "/") {
    str = str.substring(0, str.length - 1);
  }
  return str;
};

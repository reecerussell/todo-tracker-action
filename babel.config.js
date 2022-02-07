module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" }, modules: false }],
    "@babel/preset-typescript",
  ],
  plugins: ["@babel/plugin-syntax-dynamic-import"],
  ignore: ["node_modules", "**/__tests"],
};

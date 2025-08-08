/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  root: true,
  env: {
    node: true,        // Enables Node.js globals like __dirname, etc.
    commonjs: true,    // Enables require/module.exports
    es2020: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "script"  // Treat files as CommonJS
  },
  globals: {
    require: "readonly",
    exports: "readonly",
    module: "readonly"
  },
  rules: {
    "no-undef": "off",         // don’t flag require/exports
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
  }
};

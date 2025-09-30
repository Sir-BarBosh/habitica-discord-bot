const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "warn",
    }
  }
];
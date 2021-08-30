module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    "plugin:vue/strongly-recommended", 
    "eslint:recommended"
  ],
  parserOptions: {
    "parser": "babel-eslint",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "vue/attribute-hyphenation": 1,
    "vue/max-attributes-per-line": ["error", {
      "singleline": 3,
      "multiline": 1
    }],
    "vue/order-in-components": ["error", {
      "order": [
        "el", 
        "name",
        "key",
        ["delimiters", "comments"],
        "extends",
        "mixins",
        ["components", "directives", "filters"],
        "validate",
        "transition",
        "loading",
        "inheritAttrs",
        "model",
        ["props", "propsData"],
        "emits",
        "data",
        "LIFECYCLE_HOOKS",
        "watch",
        "watchQuery",
        "computed",
        "methods",
        "head",
        ["template", "render"],
        "renderError"
      ]
    }]
  },
};
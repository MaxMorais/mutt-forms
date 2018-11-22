"use strict"

module.exports = {
  "extends": ["eslint:recommended", "plugin:prettier/recommended"],
  "parser": "babel-eslint",
  "env": {
      "es6": true,
      "node": true
  },
  "rules": {
    "require-jsdoc": ["warn", {
      "require": {
          "FunctionDeclaration": true,
          "MethodDefinition": true,
          "ClassDeclaration": true,
          "ArrowFunctionExpression": false,
          "FunctionExpression": true
      }
    }],
  }
}

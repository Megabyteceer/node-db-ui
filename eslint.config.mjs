
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended, {
  rules: {
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "no-prototype-builtins": 0,
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/no-unused-vars": "off",
    "no-debugger": "off",
    "no-fallthrough": "off",
    "no-control-regex": "off",
    "indent": ["error", "tab"]
  }
}
);


/*
import tsEslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import {defineConfig} from "eslint/config";


export default defineConfig([{
  "parser": parser,
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    tsEslint
  ],
  "rules": {
    "@typescript-eslint/consistent-type-imports": "warn",
    "no-multi-spaces": "warn",
    "no-multiple-empty-lines": "warn",
    "key-spacing": "warn",
    "block-spacing": "warn",
    "space-before-blocks": "warn",
    "keyword-spacing": "warn",
    "space-infix-ops": "warn",
    "space-in-parens": "warn",
    "comma-spacing": "warn",
    "@typescript-eslint/key-spacing": "warn",
    "eol-last": "warn",
    "no-trailing-spaces": "warn",
    "no-debugger": 0,
    "prefer-const": 0,
    "indent": [
      "warn",
      "tab",
      {
        "ignoredNodes": [
          "PropertyDefinition"
        ]
      }
    ],
    "semi": "warn",
    "quotes": [
      "warn",
      "single"
    ],
    "@typescript-eslint/member-delimiter-style": [
      "warn",
      {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    "no-constant-condition": 0,
    "@typescript-eslint/consistent-type-imports": 1,
    "@typescript-eslint/no-this-alias": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-namespace": 0,
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "args": "all",
        "argsIgnorePattern": "^_",
        "caughtErrors": "all",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }
    ],
    "no-useless-catch": 0,
    "no-prototype-builtins": 0,
    "no-useless-escape": 0,
    "@typescript-eslint/no-explicit-any": 0
  }
}]);*/
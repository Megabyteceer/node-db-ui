
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  stylistic.configs.recommended,
  eslint.configs.recommended,
  tseslint.configs.recommended, {
  rules: {
    "@stylistic/member-delimiter-style": ["warn", {
      "multiline": {
        "delimiter": "semi",
        "requireLast": true
      },
      "singleline": {
        "delimiter": "semi",
        "requireLast": false
      },
      "multilineDetection": "brackets"
    }],
    "@stylistic/keyword-spacing": ["warn"],
    "@stylistic/key-spacing": ["warn"],
    "@stylistic/object-curly-spacing": ["warn"],
    "@stylistic/object-curly-spacing": ["warn"],
    "@stylistic/no-multiple-empty-lines": ["warn"],
    "@stylistic/space-infix-ops": ["warn"],
    "@stylistic/spaced-comment": ["warn"],
    "@stylistic/brace-style": ["warn", "1tbs"],
    "@stylistic/comma-dangle": ["warn", "never"],
    "@stylistic/operator-linebreak": ["off"],
    "@stylistic/multiline-ternary": ["off"],
    "@stylistic/eol-last": ["off"],
    "@stylistic/padded-blocks": ["off"],
    "@stylistic/semi": ["warn", "always"],
    "@stylistic/indent": ["warn", "tab", {"SwitchCase": 0}],
    "@stylistic/indent-binary-ops": ["warn", "tab"],
    "@stylistic/no-tabs": "off",
    '@stylistic/type-annotation-spacing': ['warn', {"before": true, "after": true, "overrides": {"colon": {"before": false, "after": true}}}],
    "@typescript-eslint/no-empty-object-type": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "no-prototype-builtins": 0,
    "@typescript-eslint/consistent-type-imports": "warn",
    "no-debugger": "off",
    "no-fallthrough": "off",
    "no-control-regex": "off",
    "no-multi-spaces": "warn",
    "no-multiple-empty-lines": "warn",
    "block-spacing": "warn",
    "space-before-blocks": "warn",
    "keyword-spacing": "warn",
    "space-infix-ops": "warn",
    "space-in-parens": "warn",
    "comma-spacing": "warn",
    "eol-last": "off",
    "no-trailing-spaces": "warn",
    "prefer-const": 0,
    "indent": ["warn", "tab"],
    "semi": "warn",
    "quotes": [
      "warn",
      "single"
    ],
    "no-constant-condition": 0,
    "@typescript-eslint/no-this-alias": 0,
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
    "no-useless-catch-useless-catch": 0,
    "no-useless-escape": 0
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
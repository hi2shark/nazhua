module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
  ],
  globals: {
    defineEmits: true,
    defineExpose: true,
    defineProps: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    camelcase: 'off',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'always',
    }],
    'vue/no-v-html': 'off',
    'vue/no-mutating-props': 'off',
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 1,
      },
      multiline: {
        max: 1,
      },
    }],
    'vue/multi-word-component-names': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/valid-v-slot': 'off',
    'vue/no-template-target-blank': 'off',
    'vuejs-accessibility/anchor-has-content': 'off',
    'vuejs-accessibility/alt-text': 'off',
    'vuejs-accessibility/label-has-for': 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/form-control-has-label': 'off',
    'vuejs-accessibility/iframe-has-title': 'off',
    'vuejs-accessibility/media-has-caption': 'off',
    'accessor-pairs': 2,
    'arrow-spacing': [2, {
      before: true,
      after: true,
    }],
    indent: [
      2, 2,
      {
        SwitchCase: 1,
        offsetTernaryExpressions: false,
      },
    ],
    'default-case-last': 'off',
    'func-names': ['error', 'never'],
    'no-console': 'off',
    'no-debugger': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'no-unsafe-optional-chaining': 'off',
    'max-len': ['warn', 120],
    'vue/max-len': ['warn', 120],
    'object-property-newline': ['error', {
      allowAllPropertiesOnSameLine: false,
    }],
    'one-var-declaration-per-line': ['error', 'always'],
    'prefer-destructuring': ['error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: true,
          object: false,
        },
      },
    ],
    'import/no-cycle': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': ['error', 'never', {
      ignorePackages: true,
      pattern: {
        vue: 'always',
      },
    }],
  },
};

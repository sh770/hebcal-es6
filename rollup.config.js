const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const json = require('@rollup/plugin-json');
const terser = require('@rollup/plugin-terser');
const pkg = require('./package.json');

const banner = '/*! ' + pkg.name + ' v' + pkg.version + ' */';

const TARGET_NODE_VER = '12.22.0';
const TARGETS_BROWSER = {
  chrome: '103',
  ie: '11',
  safari: '13.1',
};

module.exports = [
  {
    input: 'src/index.js',
    output: [
      {file: pkg.main, format: 'cjs', name: pkg.name, banner},
    ],
    plugins: [
      json({compact: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: {
              node: TARGET_NODE_VER,
            },
          }],
        ],
        exclude: ['node_modules/**'],
      }),
      nodeResolve(),
      commonjs(),
    ],
  },
  {
    input: 'src/index.js',
    output: [
      {file: pkg.module, format: 'es', name: pkg.name, banner},
    ],
    plugins: [
      json({compact: true, preferConst: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: {
              node: TARGET_NODE_VER,
            },
          }],
        ],
        exclude: ['node_modules/**'],
      }),
      nodeResolve(),
      commonjs(),
    ],
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/bundle.js',
        format: 'iife',
        name: 'hebcal',
        indent: false,
        banner,
      },
      {
        file: 'dist/bundle.min.js',
        format: 'iife',
        name: 'hebcal',
        plugins: [terser()],
        banner,
      },
    ],
    plugins: [
      json({compact: true}),
      nodeResolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: TARGETS_BROWSER,
            exclude: [
              'es.array.concat',
              'es.array.filter',
              'es.array.find',
              // sedra.js uses Array.from() - 'es.array.from' - polyfill needed by IE
              'es.array.join',
              'es.array.map',
              'es.array.splice',
              'es.function.name',
              'es.math.trunc',
              'es.number.to-fixed',
              'es.object.keys',
              'es.object.to-string',
              'es.parse-int',
              'es.regexp.exec',
              'es.regexp.to-string',
              'es.string.iterator',
              'es.string.replace',
              'es.string.split',
              'web.dom-collections.for-each',
            ],
            useBuiltIns: 'usage',
            corejs: 3,
          }],
        ],
        exclude: ['node_modules/core-js/**'],
      }),
    ],
  },
  {
    input: 'src/hdate-index.js',
    output: [
      {file: 'dist/hdate.js', format: 'cjs', banner},
    ],
    plugins: [
      json({compact: true, preferConst: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: {
              node: TARGET_NODE_VER,
            },
          }],
        ],
        exclude: ['node_modules/**'],
      }),
      nodeResolve(),
      commonjs(),
    ],
  },
  {
    input: 'src/hdate-index.js',
    output: [
      {
        file: 'dist/hdate-bundle.js',
        format: 'iife',
        name: 'hebcal',
        indent: false,
        banner,
      },
      {
        file: 'dist/hdate-bundle.min.js',
        format: 'iife',
        name: 'hebcal',
        plugins: [terser()],
        banner,
      },
    ],
    plugins: [
      json({compact: true}),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: TARGETS_BROWSER,
            useBuiltIns: false,
          }],
        ],
        exclude: ['node_modules/**'],
      }),
      commonjs(),
    ],
  },
  {
    input: 'src/hdate0-index.js',
    output: [
      {
        file: 'dist/hdate0-bundle.js',
        format: 'iife',
        name: 'hebcal',
        indent: false,
        banner,
      },
      {
        file: 'dist/hdate0-bundle.min.js',
        format: 'iife',
        name: 'hebcal',
        plugins: [terser()],
        banner,
      },
    ],
    plugins: [
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
        exclude: ['node_modules/**'],
      }),
    ],
  },
  {
    input: 'src/hdate-index.js',
    output: {file: 'dist/hdate.mjs', format: 'es', banner},
    plugins: [json({compact: true, preferConst: true})],
  },
  {
    input: 'src/hdate0-index.js',
    output: {file: 'dist/hdate0.mjs', format: 'es', banner},
  },
  {
    input: 'src/greg0.js',
    output: {file: 'dist/greg0.mjs', format: 'es', banner},
  },
];

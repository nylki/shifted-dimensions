import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'index.js',
  output: {
    format: 'iife',
    file: './dist/index.js'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};

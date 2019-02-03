import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

export default {
    input: 'src/FreactDOM.js',
    output: {
      file: 'dist/freact.js',
      format: 'umd',
      name: 'FreactDOM'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**' // only transpile our source code
      })
    ],
}
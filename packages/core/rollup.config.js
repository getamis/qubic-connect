import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const config = {
  input: 'src/index.ts',
  output: [
    {
      name: 'QubicConnect',
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
    },
  ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    commonjs(),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    typescript({
      tsconfig: 'tsconfig.build.json',
    }),
  ],
};

export default config;

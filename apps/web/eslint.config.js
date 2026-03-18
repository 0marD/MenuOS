import sharedConfig from '@menuos/config/eslint.config';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...sharedConfig,
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/sw.js',
      'next-env.d.ts',
      '*.config.js',
      '*.config.cjs',
    ],
  },
];

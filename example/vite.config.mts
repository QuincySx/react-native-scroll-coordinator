import { defineConfig } from 'vite';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default defineConfig({
  define: {
    global: 'globalThis',
    __DEV__: 'false',
  },
  resolve: {
    alias: [
      {
        find: /^react-native$/,
        replacement: require.resolve('react-native-web'),
      },
    ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
  },
});

const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/bundle.js',
  format: 'cjs',
  sourcemap: false,
  minify: false, // Отключаем минификацию для отладки
  external: [
    // Внешние зависимости, которые должны быть установлены в runtime
    'dotenv',
    'telegraf',
    'axios'
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  alias: {
    '@ngtbot': path.resolve('./src')
  },
  nodePaths: [path.resolve('./src')]
}).catch(() => process.exit(1)); 
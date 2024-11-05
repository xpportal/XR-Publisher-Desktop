import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import glslify from 'vite-plugin-glslify';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [
    react(),
    glslify(), // Using glslify instead of vite-plugin-glsl
    wasm(),
    topLevelAwait(),
  ],
  base: process.env.NODE_ENV === 'development' ? '/' : './',
  server: {
    port: 5173,
    strictPort: true,
    headers: {
		'Content-Security-Policy': [
		  "default-src 'self' https://*.sxp.digital https://*.sxpdigital.workers.dev;",
		  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;",
		  "connect-src 'self' data: blob: ws://localhost:5173 http://localhost:5173 https://*.sxp.digital https://*.sxpdigital.workers.dev https://cdn.jsdelivr.net https://cfdb.sxpdigital.workers.dev https://items.sxp.digital;",
		  "worker-src 'self' blob:;",
		  "img-src 'self' data: blob: https://* http://*;",
		  "media-src 'self' blob: https://*.sxp.digital;",
		  "style-src 'self' 'unsafe-inline';",
		  "font-src 'self' data:;",
		  "object-src 'self' https://*.sxp.digital;"
		].join('; ')
	  },
	  },
	css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@editors': resolve(__dirname, 'src/editors'),
      'three/addons/*': resolve(__dirname, 'node_modules/three/examples/jsm/*'),
      'three/addons/controls/TransformControls.js': resolve(__dirname, 'node_modules/three/examples/jsm/controls/TransformControls.js'),
      'three/examples/': resolve(__dirname, 'node_modules/three/examples/'),
      'three/addons/loaders/TGALoader.js': resolve(__dirname, 'node_modules/three/examples/jsm/loaders/TGALoader.js'),
      '../../examples/jsm/utils/SkeletonUtils.js': resolve(__dirname, 'node_modules/three/examples/jsm/utils/SkeletonUtils.js'),
      '../../examples': resolve(__dirname, 'node_modules/three/examples'),
    }
  },
  optimizeDeps: {
    include: [
      'signals',
      'react',
      'react-dom'
    ],
    exclude: [
      'rusted_gltf_transform'
    ]
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    target: ['esnext'],
    modulePreload: {
      polyfill: true
    }
  },
  assetsInclude: ['**/*.glsl', '**/*.wasm']
});
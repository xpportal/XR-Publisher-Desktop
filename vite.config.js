// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist'
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
      // Three.js paths
      'three/addons/*': resolve(__dirname, 'node_modules/three/examples/jsm/*'),
      'three/addons/controls/TransformControls.js': resolve(__dirname, 'node_modules/three/examples/jsm/controls/TransformControls.js'),
      'three/examples/': resolve(__dirname, 'node_modules/three/examples/'),
      'three/addons/loaders/TGALoader.js': resolve(__dirname, 'node_modules/three/examples/jsm/loaders/TGALoader.js'),
      '../../examples/jsm/utils/SkeletonUtils.js': resolve(__dirname, 'node_modules/three/examples/jsm/utils/SkeletonUtils.js'),
      '../../examples': resolve(__dirname, 'node_modules/three/examples'),
	  '/css': resolve(__dirname, 'editors/css'),
	  '@styles': resolve(__dirname, 'styles'),

      // Editor paths
      '/editors': resolve(__dirname, 'editors'),
      '/css': resolve(__dirname, 'editors/css'),
      '/libs': resolve(__dirname, 'editors/libs'),
      '/commands': resolve(__dirname, 'editors/commands')
    }
  },
  optimizeDeps: {
    include: [
      'signals'
    ]
  }
})

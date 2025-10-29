import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
	// Load env file based on `mode` in the current working directory.
	const env = loadEnv(mode, process.cwd(), '')
	
	return {
		plugins: [react()],
		
		// Development server configuration
		server: {
			port: 5173,
			host: true, // Allow external connections
			proxy: {
				'/api': {
					target: env.VITE_API_URL || 'http://localhost:5000',
					changeOrigin: true,
					secure: false,
				},
			},
		},
		
		// Build configuration
		build: {
			outDir: 'dist',
			sourcemap: mode === 'development',
			minify: mode === 'production' ? 'esbuild' : false,
			target: 'es2015',
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ['react', 'react-dom'],
						router: ['react-router-dom'],
						forms: ['react-hook-form'],
						http: ['axios'],
					},
				},
			},
			// Increase chunk size warning limit
			chunkSizeWarningLimit: 1000,
		},
		
		// Preview server configuration (for production builds)
		preview: {
			port: 4173,
			host: true,
		},
		
		// Define global constants
		define: {
			__APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		},
		
		// Environment variables prefix
		envPrefix: 'VITE_',
		
		// Optimize dependencies
		optimizeDeps: {
			include: ['react', 'react-dom', 'react-router-dom', 'axios', 'react-hook-form'],
		},
		
		// CSS configuration
		css: {
			devSourcemap: mode === 'development',
		},
		
		// Base public path
		base: mode === 'production' ? '/' : '/',
	}
})

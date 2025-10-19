import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    root: 'frontend',
    publicDir: 'public',
    define: {
      global: 'globalThis',
      'process.env.VITE_WALLETCONNECT_PROJECT_ID': JSON.stringify(env.VITE_WALLETCONNECT_PROJECT_ID),
      'process.env.VITE_HEDERA_NETWORK': JSON.stringify(env.VITE_HEDERA_NETWORK),
      'process.env': '{}',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'frontend/src'),
        '@reown/appkit/adapters': path.resolve(__dirname, 'frontend/mock/adapters.js'),
        buffer: 'buffer',
      },
    },
    optimizeDeps: {
      include: [
        '@hashgraph/sdk',
        '@hashgraph/hedera-wallet-connect',
        '@walletconnect/sign-client',
        '@walletconnect/universal-provider',
        '@walletconnect/utils',
        '@reown/appkit',
        '@reown/appkit-core',
        'buffer',
      ],
      esbuildOptions: {
        target: 'es2020',
        define: {
          global: 'globalThis',
        },
      },
      force: true,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2020',
      commonjsOptions: {
        include: [/@hashgraph/, /@walletconnect/, /@reown/, /node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'frontend/index.html'),
          app: path.resolve(__dirname, 'frontend/app.html'),
          walletTest: path.resolve(__dirname, 'frontend/wallet-test.html'),
        },
        output: {
          format: 'es',
          manualChunks: {
            'hedera-wallet-vendor': ['@hashgraph/hedera-wallet-connect'],
            'hashgraph-vendor': ['@hashgraph/sdk'],
            'walletconnect-vendor': ['@walletconnect/sign-client', '@walletconnect/universal-provider'],
          },
          // Optimize chunk loading
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // Enable compression
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
        },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});
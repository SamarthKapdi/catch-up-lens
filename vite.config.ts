import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { processCatchUpRequest } from './src/server/catchupHandler';

// Load local environment variables
dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-catchup-dev-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/catchup' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const result = await processCatchUpRequest(parsed);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify(result));
              } catch (err) {
                console.error('Local dev /api/catchup error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Failed to process summary' }));
              }
            });
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
    host: true,
  },
});

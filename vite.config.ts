import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  if (apiKey) {
    process.env.GEMINI_API_KEY = apiKey;
  }

  return {
    plugins: [
      react(),
      {
        name: 'api-chat-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/chat') && req.method === 'POST') {
              try {
                const { default: handler } = await server.ssrLoadModule('./api/chat.ts');
                let bodyStr = '';
                req.on('data', (chunk) => {
                  bodyStr += chunk;
                });
                req.on('end', async () => {
                  (req as any).body = bodyStr;
                  (res as any).status = (statusCode: number) => {
                    res.statusCode = statusCode;
                    return res;
                  };
                  (res as any).json = (data: any) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  };
                  await handler(req, res);
                });
              } catch (err: any) {
                console.error('Dev /api/chat error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err?.message || 'Dev server error' }));
              }
              return;
            }
            next();
          });
        }
      }
    ]
  };
});

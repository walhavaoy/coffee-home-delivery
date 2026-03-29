import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import mealsRouter from './routes/meals';

const logger = pino({ name: 'taskmaster' });

export function createApp(): express.Application {
  const app = express();
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use('/api/meals', mealsRouter);

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}

if (require.main === module) {
  const port = parseInt(process.env['PORT'] ?? '8080', 10);
  const app = createApp();
  app.listen(port, () => {
    logger.info({ port }, 'taskmaster listening');
  });
}

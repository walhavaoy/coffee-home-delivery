import express from 'express';
import path from 'path';
import pino from 'pino';

const logger = pino({ name: 'meals-ui' });

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'meals-ui server listening');
});

function shutdown(signal: string): void {
  logger.info({ signal }, 'shutting down');
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

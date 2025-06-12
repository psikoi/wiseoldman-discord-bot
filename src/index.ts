import * as sentry from './services/sentry';
import * as api from './api';
import bot from './bot';
import { deployCommands } from './deploy-commands';
import prometheus from './services/prometheus';

(async function () {
  await deployCommands();

  const client = await bot.init();
  const server = api.init(client);

  let isShuttingDown = false;

  async function handleShutdown() {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log('Shutting down gracefully...');

    try {
      prometheus.shutdown();
      await new Promise(res => server.close(res));

      console.log('Shutdown complete.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err, true);
      process.exit(1);
    }
  }

  process.on('SIGTERM', () => handleShutdown());
  process.on('SIGINT', () => handleShutdown());

  process.on('exit', code => {
    console.log(`Process exiting with code ${code}`);
  });

  process.on('unhandledRejection', reason => {
    console.error('Unhandled Rejection:', reason, true);
    sentry.captureError(reason);
  });

  process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error, true);
    sentry.captureError(error);
  });

  prometheus.init();
})();

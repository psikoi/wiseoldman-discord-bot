import env from '../env';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';

Sentry.init({
  dsn: env.BOT_SENTRY_DSN,
  tracesSampleRate: 0.01
});

export function captureError(error: Error | unknown) {
  if (error instanceof Error) {
    return Sentry.captureException(error);
  }

  if (typeof error === 'string') {
    return Sentry.captureException(error);
  }

  if (error !== null && typeof error === 'object' && 'code' in error) {
    return Sentry.captureException(error.code, {
      extra: {
        error
      }
    });
  }

  return Sentry.captureException(JSON.stringify(error), {
    extra: {
      error
    }
  });
}

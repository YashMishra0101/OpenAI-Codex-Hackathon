import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

import * as Sentry from '@sentry/react';

const rootElement = document.getElementById('root');

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, 
    // Session Replay
    replaysSessionSampleRate: 0.1, 
    replaysOnErrorSampleRate: 1.0, 
  });
}

if (!rootElement) {
  throw new Error(
    'Root element #root not found in index.html. The React app cannot mount.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

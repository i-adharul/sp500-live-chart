import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.jsx';
import store from './app/store';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Suppress Google GSI and COOP warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('google.accounts.id.initialize') ||
     args[0].includes('Cross-Origin-Opener-Policy'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Also suppress console.error for COOP
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Cross-Origin-Opener-Policy')
  ) {
    return;
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </Provider>,
);


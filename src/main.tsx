import { Buffer } from 'buffer';
// Polyfill Buffer for music-metadata-browser
window.Buffer = window.Buffer || Buffer;
if (typeof global === 'undefined') {
  (window as any).global = window;
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

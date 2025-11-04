
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: The error on the next line indicates 'App' is not a named export. It should be a default import.
// Fix: Changed to a named import as 'App' is a named export.
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
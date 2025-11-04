
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { EnvironmentChecker } from './components/EnvironmentChecker';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <EnvironmentChecker>
      <AuthProvider>
        <App />
      </AuthProvider>
    </EnvironmentChecker>
  </React.StrictMode>
);
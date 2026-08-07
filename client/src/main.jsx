/**
 * Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import i18n from './i18n';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <I18nextProvider i18n={i18n}>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1C2541',
                  color: '#F7F1E6',
                },
              }}
            />
          </I18nextProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
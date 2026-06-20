import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { SiteContentProvider } from '@/contexts/SiteContentContext';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AdminAuthProvider>
      <SiteContentProvider>
        <App />
      </SiteContentProvider>
    </AdminAuthProvider>
  </ErrorBoundary>
);

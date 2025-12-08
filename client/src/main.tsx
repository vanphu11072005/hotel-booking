import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import ErrorBoundary from 
  './components/common/ErrorBoundary.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import './styles/index.css';
import './styles/datepicker.css';
import './i18n';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
);

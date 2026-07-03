import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AdminPage from './Admin/AdminPage.tsx';
import { StyledEngineProvider } from '@mui/material/styles';

const isAdminRoute = window.location.pathname.replace(/\/+$/, '') === '/admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      {isAdminRoute ? <AdminPage /> : <App />}
    </StyledEngineProvider>
  </StrictMode>,
);

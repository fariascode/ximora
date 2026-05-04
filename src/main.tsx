import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigErrorScreen } from './components/ConfigErrorScreen';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth';
import { supabaseConfigError } from './lib/supabaseClient';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {supabaseConfigError ? (
      <ConfigErrorScreen />
    ) : (
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    )}
  </StrictMode>,
);

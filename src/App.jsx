import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline /> {/* Normaliza os estilos do MUI */}
      <AuthProvider> {/* O contexto de Auth envolve tudo */}
        <AppRouter />  {/* O Roteador decide qual página mostrar */}
      </AuthProvider>
    </>
  );
}

export default App;
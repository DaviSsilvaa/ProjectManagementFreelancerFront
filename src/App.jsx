import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline /> 
      <AuthProvider>
        <AppRouter />  
      </AuthProvider>
    </>
  );
}

export default App;
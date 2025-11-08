/*
  ESTE É O ESTILO COM A BOX DE LOGIN COMO NA IMAGEM ENVIADA
  (Neumorphism + Gradiente Lateral)
*/
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  SvgIcon, // Para o ícone da bolsa de compras
  IconButton, // Para botões de ícone das redes sociais
} from '@mui/material';
import { Navigate } from 'react-router-dom';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, token } = useAuth();

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); 
    try {

      await delay(2000);


      await login(email, password);

    } catch (err) {
      setError('Email ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return <Navigate to="/dashboard" replace state={{formLogin: true}} />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        // Fundo branco da página, como na imagem
        bgcolor: '#8f97a0ff',
      }}
    >
      <Paper
        elevation={10} // Sombra forte para o "card" principal
        sx={{
          display: 'flex',
          borderRadius: '30px', // Cantos arredondados do card grande
          overflow: 'hidden', // Importante para o gradiente da esquerda
          maxWidth: '1200px', // A largura total do seu componente
          width: '100%',
          minHeight: { xs: 'auto', md: '600px' }, // Altura mínima para desktop
          boxShadow: '2px 14px 11px rgba(0, 0, 0, 0.1)', // Sombra mais sutil
        }}
      >
        {/* Lado Esquerdo: "Welcome Page" com gradiente */}
        <Box
          sx={{
            width: { xs: '100%', md: '45%' }, // 45% da largura total em desktop
            display: { xs: 'none', md: 'flex' }, // Esconde em telas pequenas
            flexDirection: 'column',
            justifyContent: 'space-between', // Para posicionar icones e texto
            alignItems: 'flex-start',
            p: 6, // Padding grande
            // Gradiente verde/azul como na imagem
            background: 'linear-gradient(135deg, #63737cff 0%, #65baebff 100%)',
            position: 'relative',
            color: 'white',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '30px',
              bgcolor: 'rgba(255,255,255,0.2)',
              left: '-50px',
              top: '10%',
              transform: 'rotate(-20deg)',
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: '150px',
              height: '150px',
              borderRadius: '30px',
              bgcolor: 'rgba(255,255,255,0.2)',
              right: '-30px',
              bottom: '20%',
              transform: 'rotate(10deg)',
              zIndex: 0,
            }}
          />


          {/* Texto "Welcome Page" */}
          <Box sx={{ mt: 'auto', zIndex: 1 }}> {/* Usa mt: 'auto' para empurrar para baixo */}
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              Welcome Page
            </Typography>
            <Typography variant="subtitle1">
              Sign in to continue access pages
            </Typography>
          </Box>
        </Box>

        {/* Lado Direito: Formulário de Login */}
        <Box
          sx={{
            width: { xs: '100%', md: '55%' }, // 55% da largura total em desktop
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 4, sm: 6, md: 8 }, // Padding responsivo
            bgcolor: 'white',
            borderRadius: { xs: '30px', md: '0 30px 30px 0' }, // Arredondado em telas pequenas, e apenas na direita em desktop
          }}
        >
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
            Sign In
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 4, color: '#888' }}>
            Sign in to continue access pages
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoFocus
              variant="outlined" // Use outlined ou filled para este estilo
              sx={{
                borderRadius: '15px', // Cantos arredondados
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px',
                  bgcolor: '#f0f2f5', // Fundo levemente cinza, como na imagem
                  '& fieldset': { borderColor: 'transparent' }, // Sem borda visível
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: '#6aa5ddff' }, // Borda verde no foco
                },
                mb: 2,
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              variant="outlined"
              sx={{
                borderRadius: '15px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px',
                  bgcolor: '#f0f2f5',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: '#6aa5ddff' },
                },
                mb: 3,
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                mb: 3,
                py: 1.8, // Botão mais alto
                borderRadius: '15px', // Cantos arredondados
                background: 'linear-gradient(90deg, #727574ff 0%, #89b6e0ff 100%)', // Gradiente no botão
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: 'none', // Remove a sombra padrão para o Neumorphism
                '&:hover': {
                  opacity: 0.9,
                  boxShadow: 'none',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'CONTINUE'}
            </Button>
          </Box>


        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
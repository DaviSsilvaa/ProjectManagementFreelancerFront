/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TextField, Button, Box, Typography, CircularProgress,
  Alert, Paper, InputAdornment, IconButton
} from '@mui/material';
import { 
  Email as EmailIcon, Lock as LockIcon, 
  Visibility, VisibilityOff 
} from '@mui/icons-material';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion'; //

const LOGIN_FIELD_STYLE = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '15px',
    bgcolor: '#F8FAFC',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover': { bgcolor: '#F1F5F9' },
    '&.Mui-focused': {
      bgcolor: '#FFFFFF',
      '& fieldset': { borderColor: '#4F46E5', borderWidth: '2px' },
    },
  },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#94A3B8' },
};

// Variantes de animação para reutilizar
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); 
    try {
      await login(email, password);
    } catch (err) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  if (token) return <Navigate to="/dashboard" replace />;

  return (
  <Box
    sx={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      position: 'relative',
      overflow: 'hidden',
      // FUNDO: Grid Geométrico Visível
      backgroundColor: '#F8FAFC',
      backgroundImage: `
        linear-gradient(rgba(203, 213, 225, 0.4) 1px, transparent 1px),
        linear-gradient(90deg, rgba(203, 213, 225, 0.4) 1px, transparent 1px)
      `,
      backgroundSize: '45px 45px',
    }}
  >
    {/* 1. BOLHA ANIMADA SUPERIOR (ROXA) */}
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        x: [-30, 30, -30],
        opacity: [0.4, 0.6, 0.4] 
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: 'absolute', top: '5%', left: '5%',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
        filter: 'blur(70px)',
        zIndex: 0,
      }}
    />

    {/* 2. BOLHA ANIMADA INFERIOR (AZUL) */}
    <motion.div
      animate={{ 
        scale: [1, 1.3, 1],
        x: [30, -30, 30],
        opacity: [0.3, 0.5, 0.3] 
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: 'absolute', bottom: '5%', right: '5%',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
        filter: 'blur(90px)',
        zIndex: 0,
      }}
    />

    {/* 3. CARD DE LOGIN PRINCIPAL */}
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ zIndex: 1, width: '100%', maxWidth: '1100px' }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          borderRadius: '30px',
          overflow: 'hidden',
          minHeight: '620px',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)', // Efeito de vidro
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}
      >
        {/* LADO ESQUERDO: SEÇÃO DE BOAS-VINDAS */}
        <Box
          sx={{
            width: { xs: '100%', md: '45%' },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            p: 6,
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            color: 'white',
            position: 'relative'
          }}
        >
          <Box sx={{ zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-2.5px' }}>
              FREELA.SYS
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, lineHeight: 1.4, maxWidth: '320px' }}>
              Gerencie seus projetos e clientes com inteligência de dados em tempo real.
            </Typography>
          </Box>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            style={{ 
              position: 'absolute', width: '250px', height: '250px', 
              borderRadius: '60px', border: '2px solid rgba(255,255,255,0.08)', 
              top: '-80px', left: '-80px' 
            }}
          />
        </Box>

        {/* LADO DIREITO: FORMULÁRIO */}
        <Box sx={{ 
          width: { xs: '100%', md: '55%' }, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: { xs: 4, md: 8 }, 
          bgcolor: 'white' 
        }}>
          
          <Box sx={{ textAlign: 'center', mb: 5, width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E293B', mb: 1 }}>Login</Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Bem-vindo de volta</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: '15px' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal" required fullWidth label="E-mail"
              sx={LOGIN_FIELD_STYLE}
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField
              margin="normal" required fullWidth label="Senha"
              type={showPassword ? 'text' : 'password'}
              sx={LOGIN_FIELD_STYLE}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 5, mb: 2, py: 2.2, borderRadius: '18px',
                background: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)',
                fontWeight: 900, fontSize: '1rem',
                boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'ENTRAR NO SISTEMA'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  </Box>
);
}

export default Login;
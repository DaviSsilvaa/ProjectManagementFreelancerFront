/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import NotesIcon from '@mui/icons-material/Notes';
import { useNavigate } from 'react-router-dom';

function RegisterClient() {
  const navigate = useNavigate();

  // form state
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes]     = useState('');

  // ui state
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  // validators
  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const nameOk  = useMemo(() => name.trim().length >= 3, [name]);
  const phoneDigits = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  const phoneOk = useMemo(() => phoneDigits.length >= 10, [phoneDigits]);
  const canSubmit = nameOk && emailOk && phoneOk && !loading;

  // máscara simples (BR)
  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  };
  const handlePhone = (e) => setPhone(formatPhone(e.target.value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;

    setLoading(true);
    try {
      await api.post('/clients', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        notes: notes.trim(),
      });
      setSuccessOpen(true);
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      const apiMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Erro ao criar cliente. Tente novamente.';
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        // tela inteira
        width: '100%',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '42% 58%' },
        background: 'linear-gradient(135deg, #eef2f7 0%, #e9f4f2 100%)',
      }}
    >
      {/* Lado Esquerdo – vitrine em gradiente (some no mobile) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#fff',
          background: 'linear-gradient(135deg, #6a8fe8 0%, #5fd1c8 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* shapes decorativos */}
        <Box
          sx={{
            position: 'absolute',
            width: 220, height: 220, borderRadius: 6,
            bgcolor: 'rgba(255,255,255,0.18)', top: 48, left: -40, transform: 'rotate(-16deg)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 160, height: 160, borderRadius: 6,
            bgcolor: 'rgba(255,255,255,0.18)', bottom: 80, right: -30, transform: 'rotate(12deg)',
          }}
        />

        {/* topo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.18)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>Voltar</Typography>
        </Box>

        {/* conteúdo */}
        <Box sx={{ zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonAddAlt1Icon />
            <Typography variant="h4" fontWeight={800}>
              Cadastrar Cliente
            </Typography>
          </Box>
          <Typography sx={{ opacity: 0.95 }}>
            Organize sua base de clientes para agilizar orçamentos, projetos e faturas.
          </Typography>
        </Box>

        {/* rodapé dica */}
        <Box sx={{ zIndex: 1, opacity: 0.9 }}>
          <Typography variant="overline">Dica</Typography>
          <Typography variant="body2">
            Campos <b>Nome</b>, <b>Email</b> e <b>Telefone</b> são obrigatórios.
          </Typography>
        </Box>
      </Box>

      {/* Lado Direito – formulário em tela cheia com scroll */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          bgcolor: '#fff',
          height: '100vh',
          overflowY: 'auto',
          px: { xs: 3, md: 6 },
          py: { xs: 2, md: 6 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* topbar mobile */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>Cadastrar Cliente</Typography>
        </Box>

        <Typography variant="h5" fontWeight={800} sx={{ mb: 1, color: '#222' }}>
          Informações do Cliente
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
          Preencha os dados abaixo para criar um novo cliente.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            label="Nome *"
            placeholder="Ex.: João da Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={name.length > 0 && !nameOk}
            helperText={name.length > 0 && !nameOk ? 'Digite ao menos 3 caracteres.' : ' '}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonAddAlt1Icon fontSize="small" />
                </InputAdornment>
              ),
            }}
            fullWidth
            autoFocus
            autoComplete="name"
          />

          <TextField
            label="Empresa"
            placeholder="Ex.: Acme Ltda."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            fullWidth
            autoComplete="organization"
          />

          <TextField
            label="Email *"
            placeholder="cliente@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={email.length > 0 && !emailOk}
            helperText={email.length > 0 && !emailOk ? 'Email inválido.' : ' '}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            fullWidth
            type="email"
            autoComplete="email"
          />

          <TextField
            label="Telefone *"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={handlePhone}
            error={phone.length > 0 && !phoneOk}
            helperText={phone.length > 0 && !phoneOk ? 'Informe ao menos DDD + número.' : ' '}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIphoneIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            fullWidth
            inputMode="tel"
            autoComplete="tel"
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        <TextField
          label="Notas"
          placeholder="Observações importantes sobre o cliente…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={5}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', pt: 1 }}>
                <NotesIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          fullWidth
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
          <Button variant="text" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!canSubmit}
            sx={{ px: 3, fontWeight: 700, borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Cadastrar'}
          </Button>
        </Box>

        {/* espaçador para não colar no fim em telas pequenas */}
        <Box sx={{ height: 16 }} />
      </Box>

      <Snackbar
        open={successOpen}
        autoHideDuration={2500}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Cliente cadastrado com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RegisterClient;

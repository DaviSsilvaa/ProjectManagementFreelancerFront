import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, CircularProgress, 
  Alert, Snackbar, Paper, Grid, Divider, Stack, InputAdornment 
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Business as BusinessIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  Description as NotesIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppLayout from "../layout/AppLayout";

function RegisterClient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', company: '', 
    taxId: '', address: '', notes: '' 
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ error: '', success: false });

  const handleChange = (field) => (e) => {
  let value = e.target.value;

  if (field === 'phone') {
    // Remove tudo que não é dígito
    value = value.replace(/\D/g, "");

    // Aplica a máscara (99) 99999-9999 ou (99) 9999-9999
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    }
  }

  setFormData({ ...formData, [field]: value });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/clients', formData);
      setStatus({ ...status, success: true });
      setTimeout(() => navigate('/dashboard/clients'), 1000);
    } catch (err) {
      console.log(err);
      
      setStatus({ ...status, error: 'Falha ao processar o registro no servidor.' });
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Ficha de Cadastro Empresarial">
      {/* Container sem limite de largura para esticar em telas grandes */}
      <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 6 }, 
            borderRadius: '16px', 
            border: '1px solid #E2E8F0', 
            bgcolor: '#FFF',
            minHeight: '80vh' // Garante que o card preencha a altura da tela
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              
              {/* SEÇÃO 1: IDENTIFICAÇÃO - Campos Compridos */}
              <Box>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 4, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  01. Identificação de Mercado
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} xl={8}>
                    <TextField 
                      fullWidth 
                      label="Nome Completo / Razão Social *" 
                      variant="outlined" 
                      value={formData.name} 
                      onChange={handleChange('name')} 
                      required 
                      InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }} 
                    />
                  </Grid>
                  <Grid item xs={12} xl={4}>
                    <TextField 
                      fullWidth 
                      label="CPF / CNPJ" 
                      variant="outlined" 
                      value={formData.taxId} 
                      onChange={handleChange('taxId')} 
                      InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment> }} 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Nome da Empresa / Grupo Econômico" 
                      variant="outlined" 
                      value={formData.company} 
                      onChange={handleChange('company')}
                      InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon color="action" /></InputAdornment> }} 
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* SEÇÃO 2: CONTATO E LOCALIZAÇÃO */}
              <Box>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 4, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  02. Canais e Endereçamento
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth 
                      label="E-mail Corporativo de Contato *" 
                      variant="outlined" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange('email')} 
                      required
                      InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }} 
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
  <TextField 
    fullWidth 
    label="Telefone / WhatsApp Comercial *" 
    variant="outlined" 
    value={formData.phone} 
    onChange={handleChange('phone')} 
    required
    placeholder="(00) 00000-0000"
    inputProps={{ maxLength: 15 }}
    InputProps={{ 
      startAdornment: (
        <InputAdornment position="start">
          <PhoneIcon color="action" />
        </InputAdornment>
      ) 
    }} 
  />
</Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Endereço Completo (Sede ou Filial)" 
                      variant="outlined" 
                      value={formData.address} 
                      onChange={handleChange('address')}
                      InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon color="action" /></InputAdornment> }} 
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* SEÇÃO 3: NOTAS - Área de texto expandida */}
              <Box>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800, mb: 4, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  03. Observações de Gestão
                </Typography>
                <TextField 
                  fullWidth 
                  label="Notas Estratégicas e Histórico" 
                  multiline 
                  rows={8} 
                  variant="outlined"
                  value={formData.notes} 
                  onChange={handleChange('notes')}
                  placeholder="Descreva detalhes importantes sobre a prospecção, termos de contrato ou preferências do cliente..."
                />
              </Box>

              {/* FOOTER DE AÇÕES - Fixado no final do card comprido */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, pt: 5, borderTop: '1px solid #E2E8F0' }}>
                <Button 
                  onClick={() => navigate(-1)} 
                  variant="text" 
                  sx={{ color: '#64748B', fontWeight: 800, px: 4, fontSize: '1rem' }}
                >
                  Descartar Cadastro
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disableElevation 
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{ 
                    px: 8, 
                    py: 2, 
                    borderRadius: '12px', 
                    fontWeight: 900, 
                    fontSize: '1rem',
                    bgcolor: '#4F46E5',
                    '&:hover': { bgcolor: '#4338CA' }
                  }} 
                  disabled={loading}
                >
                  {loading ? 'Salvando dados...' : 'Finalizar Registro'}
                </Button>
              </Box>

            </Stack>
          </form>
        </Paper>
      </Box>

      <Snackbar open={status.success} autoHideDuration={3000}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>
          O parceiro comercial foi registrado com sucesso!
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}

export default RegisterClient;
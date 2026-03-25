import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, CircularProgress, 
  Alert, Snackbar, Paper, Grid, Divider, Stack, InputAdornment, Avatar
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Business as BusinessIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Save as SaveIcon,
  ChevronLeft as BackIcon
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
      value = value.replace(/\D/g, "");
      if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
        value = value.replace(/(\d)(\d{4})$/, "$1-$2");
      }
    }

    if (field === 'taxId') {
      value = value.replace(/\D/g, "").substring(0, 14);
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      } else {
        value = value.replace(/^(\d{2})(\d)/, "$1.$2");
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
        value = value.replace(/(\d{4})(\d)/, "$1-$2");
      }
    }
    setFormData({ ...formData, [field]: value });
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      transition: "all 0.2s",
      backgroundColor: "#F8FAFC",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#CBD5E1" },
      "&.Mui-focused fieldset": { borderColor: "#4F46E5", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": { fontWeight: 500, color: "#64748B" }
  };

  const SectionHeader = ({ icon, title, number }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Avatar sx={{ bgcolor: '#4F46E5', width: 32, height: 32, fontSize: '0.875rem', fontWeight: 700 }}>
        {number}
      </Avatar>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1E293B", textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Typography>
    </Box>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/clients', formData);
      setStatus({ ...status, success: true });
      setTimeout(() => navigate('/dashboard/clients'), 1500);
    } catch (err) {
      setStatus({ ...status, error: 'Erro ao salvar. Verifique os dados.' });
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Novo Parceiro Comercial">
      <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4 }}>
        
        {/* Header de Navegação */}
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mb: 3, color: '#64748B', fontWeight: 700, textTransform: 'none' }}
        >
          Voltar para listagem
        </Button>

        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: '24px', 
            border: '1px solid #E2E8F0', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            bgcolor: '#FFF'
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={5}>
              
              {/* SEÇÃO 1 */}
              <Box>
                <SectionHeader number="01" title="Identificação" />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <TextField 
                      fullWidth label="Nome Completo / Razão Social *" 
                      value={formData.name} onChange={handleChange('name')} required 
                      sx={inputStyle}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }} 
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField 
                      fullWidth label="CPF / CNPJ" 
                      value={formData.taxId} onChange={handleChange('taxId')} 
                      inputProps={{ maxLength: 18 }} sx={inputStyle}
                      InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }} 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth label="Nome da Empresa / Grupo" 
                      value={formData.company} onChange={handleChange('company')}
                      sx={inputStyle}
                      InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }} 
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* SEÇÃO 2 */}
              <Box>
                <SectionHeader number="02" title="Contato e Localização" />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth label="E-mail Principal *" type="email" 
                      value={formData.email} onChange={handleChange('email')} required
                      sx={inputStyle}
                      InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }} 
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth label="Telefone / WhatsApp *" 
                      value={formData.phone} onChange={handleChange('phone')} required
                      inputProps={{ maxLength: 15 }} sx={inputStyle}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }} 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth label="Endereço da Sede" 
                      value={formData.address} onChange={handleChange('address')}
                      sx={inputStyle}
                      InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon sx={{ color: '#94A3B8' }} /></InputAdornment> }} 
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* SEÇÃO 3 */}
              <Box>
                <SectionHeader number="03" title="Notas Estratégicas" />
                <TextField 
                  fullWidth multiline rows={4} label="Histórico e Observações" 
                  value={formData.notes} onChange={handleChange('notes')}
                  placeholder="Ex: Cliente prefere reuniões às terças..."
                  sx={inputStyle}
                />
              </Box>

              {/* Ações */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                <Button 
                  onClick={() => navigate(-1)} 
                  sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none', px: 3 }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disableElevation 
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{ 
                    px: 6, py: 1.5, borderRadius: '12px', fontWeight: 800, textTransform: 'none',
                    bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA', boxShadow: '0 8px 15px -3px rgb(79 70 229 / 0.4)' }
                  }} 
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Salvar Registro'}
                </Button>
              </Box>

            </Stack>
          </form>
        </Paper>
      </Box>

      <Snackbar 
        open={status.success} 
        autoHideDuration={3000} 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert variant="filled" severity="success" sx={{ borderRadius: '12px', fontWeight: 700, bgcolor: '#10B981' }}>
          Parceiro registrado com sucesso!
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}

export default RegisterClient;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext'; 
import {
  Box, Typography, CircularProgress, Button, Paper, Avatar, 
  Divider, Grid, Chip, Stack, Tooltip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  WhatsApp as WhatsAppIcon,
  Assignment as ProjectIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import AppLayout from "../layout/AppLayout"; 

// Gera uma cor hexadecimal única baseada no nome do cliente
const stringToColor = (string) => {
  let hash = 0;
  if (!string) return '#30CFD0'; // Cor padrão caso a string seja vazia
  
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// Extrai as iniciais do nome para o Avatar
const getInitials = (name) => {
  if (!name) return '?';
  const names = name.trim().split(/\s+/);
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

function ClientDetail() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchClient = async () => {
      try {
        const response = await api.get(`/clients/${id}`); 
        setClient(response.data);
      } catch (error) {
        if (error.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id, logout]);

  if (loading) return (
    <AppLayout title="Carregando..."><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></AppLayout>
  );

  return (
    <AppLayout title={`Perfil: ${client?.name || 'Cliente'}`}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        
        {/* CABEÇALHO DE AÇÃO */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}
          >
            Voltar
          </Button>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="primary" sx={{ borderRadius: '10px', textTransform: 'none' }}>Editar Perfil</Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* COLUNA ESQUERDA: Perfil e Contato */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: stringToColor(client?.name || ''), 
                  width: 100, height: 100, mx: 'auto', mb: 2, fontSize: '2rem', fontWeight: 800,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }}
              >
                {getInitials(client?.name)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B' }}>{client?.name}</Typography>
              <Chip 
                label={client?.company || "Pessoa Física"} 
                size="small" 
                sx={{ mt: 1, bgcolor: '#F1F5F9', fontWeight: 600, color: '#475569' }} 
              />

              <Divider sx={{ my: 3 }} />

              <Stack spacing={2} sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', width: 32, height: 32 }}><EmailIcon sx={{ fontSize: 18 }} /></Avatar>
                  <Typography variant="body2" sx={{ color: '#64748B', wordBreak: 'break-all' }}>{client?.email || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', width: 32, height: 32 }}><PhoneIcon sx={{ fontSize: 18 }} /></Avatar>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>{client?.phone || 'N/A'}</Typography>
                </Box>
              </Stack>

              {client?.phone && (
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="success" 
                  startIcon={<WhatsAppIcon />}
                  sx={{ mt: 4, borderRadius: '12px', py: 1.5, fontWeight: 700, textTransform: 'none', bgcolor: '#22C55E' }}
                  onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g,'')}`, '_blank')}
                >
                  Conversar agora
                </Button>
              )}
            </Paper>
          </Grid>

          {/* COLUNA DIREITA: Métricas e Notas */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Cards de Resumo Rápido */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#FFF7ED', color: '#EA580C' }}><ProjectIcon /></Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>--</Typography>
                      <Typography variant="caption" color="text.secondary">Projetos Realizados</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#F0FDF4', color: '#16A34A' }}><MoneyIcon /></Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>R$ 0,00</Typography>
                      <Typography variant="caption" color="text.secondary">Total Faturado</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Notas */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Observações Estratégicas
                </Typography>
                <Box sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {client?.notes || "Nenhuma nota registrada para este parceiro."}
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}

export default ClientDetail;
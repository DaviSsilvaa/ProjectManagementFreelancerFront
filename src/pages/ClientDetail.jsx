import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext'; 
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Avatar, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Notes as NotesIcon
} from '@mui/icons-material';

// Função para pegar as iniciais (mesma do Dashboard)
const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.length > 2 ? initials.substring(0, 2) : initials;
};

function ClientDetail() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Pega o 'id' da URL
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  useEffect(() => {
    // Scroll para o topo ao carregar
    window.scrollTo(0, 0);

    const fetchClient = async () => {
      try {
        // Busca o cliente específico
        const response = await api.get(`/clients/${id}`); 
        setClient(response.data);
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id, logout]); 

  const handleBack = () => {
    navigate('/dashboard'); // Volta para o Dashboard
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f0f2f5', // Fundo cinza consistente
    }}>
      <Box sx={{ pt: 4, pb: 4, px: 4 }}>
        
        {/* Cabeçalho com Botão "Voltar" */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button 
            variant="outlined" 
            onClick={handleBack} 
            startIcon={<ArrowBackIcon />}
            sx={{ 
              color: '#30CFD0', 
              borderColor: '#30CFD0', 
              '&:hover': { 
                borderColor: '#30CFD0',
                bgcolor: 'rgba(48, 207, 208, 0.04)' 
              } 
            }}
          >
            Voltar para o Dashboard
          </Button>
        </Box>

        {/* Card de Detalhes do Cliente */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : !client ? (
          <Paper sx={{ p: 3, borderRadius: '16px', textAlign: 'center' }}>
            <Typography>Cliente não encontrado.</Typography>
          </Paper>
        ) : (
          <Paper 
            sx={{ 
              p: { xs: 2, sm: 4 }, 
              borderRadius: '16px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            {/* Secção de Identificação (Avatar e Nome) */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ 
                bgcolor: '#30CFD0', 
                mr: 2, 
                fontWeight: 'bold',
                width: 56,
                height: 56,
                fontSize: '1.5rem'
              }}>
                {getInitials(client.name)}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {client.name}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Lista de Detalhes (Email, Telefone, Empresa) */}
            <List sx={{ mb: 4 }}>
              <ListItem>
                <ListItemIcon sx={{ color: '#30CFD0' }}>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={client.email || 'Não informado'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ color: '#30CFD0' }}>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Telefone" 
                  secondary={client.phone || 'Não informado'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ color: '#30CFD0' }}>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Empresa" 
                  secondary={client.company || 'Não informado'} 
                />
              </ListItem>
            </List>
            
            {/* Secção de "Notas" (para textos longos) */}
            <Typography variant="h6" sx={{ color: '#30CFD0', fontWeight: 'bold', mb: 2 }}>
              <NotesIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Notas
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                bgcolor: '#fafafa', 
                borderColor: '#eee', 
                borderRadius: '12px',
                minHeight: '100px'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ color: '#555', whiteSpace: 'pre-wrap' }}
              >
                {client.notes || 'Nenhuma nota registada.'}
              </Typography>
            </Paper>

          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default ClientDetail;
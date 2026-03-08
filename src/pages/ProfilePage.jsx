import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Avatar, 
  Grid, Paper, Stack, IconButton, Badge, Divider,
  InputAdornment, LinearProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  PhotoCamera as CameraIcon, 
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// --- ESTILIZAÇÃO CONSTANTE (DESIGN SYSTEM) ---

const FIELD_STYLE = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#6366F1' },
    '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { color: '#64748B', fontWeight: 600 },
};

const DISABLED_FIELD_STYLE = {
  ...FIELD_STYLE,
  '& .MuiOutlinedInput-root': {
    ...FIELD_STYLE['& .MuiOutlinedInput-root'],
    backgroundColor: '#F1F5F9',
    opacity: 0.8
  }
};

const BUTTON_STYLE = {
  background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
  borderRadius: '14px',
  px: 8,
  py: 2,
  fontWeight: 900,
  boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)',
  textTransform: 'none',
  fontSize: '1rem',
  '&:hover': { 
    transform: 'translateY(-2px)', 
    boxShadow: '0 15px 25px rgba(79, 70, 229, 0.4)' 
  }
};

export default function ProfilePage() {
  const { user, updateUserInfo } = useAuth(); 
  const [loading, setLoading] = useState(false);
  
  // Estado inicial baseado nos dados do usuário logado
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    specialty: user?.specialty || 'Desenvolvedor Pleno'
  });
  
  const [preview, setPreview] = useState(user?.avatar_url || '');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
  try {
    // Verifique se o caminho da API está correto no seu backend
    await api.patch(`/users/${userId}/role`, { role: newRole });
    alert("Nível de acesso alterado com sucesso!");
    
    // Opcional: recarregar os dados do usuário para atualizar o token
    globalThis.location.reload(); 
  } catch (err) {
    console.error("Erro ao mudar permissão:", err);
    alert("Erro: Verifique se você é Admin no banco de dados.");
  }
};

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserInfo({ ...formData, avatar_url: preview }); 
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 1, maxWidth: '1100px', mx: 'auto' }}>
      
      {/* HEADER DA PÁGINA */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E293B', letterSpacing: '-0.5px' }}>
          Meu Perfil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie suas informações e sua identidade visual no sistema.
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: '10px', height: 6, bgcolor: '#EEF2FF' }} />}

      <Grid container spacing={4} alignItems="stretch">
        
        {/* 1. CARD DA ESQUERDA (IDENTIDADE VISUAL) */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 4, textAlign: 'center', borderRadius: '24px', 
            border: '1px solid #E2E8F0', height: '100%',
            bgcolor: '#FFF', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton 
                  component="label" 
                  sx={{ 
                    bgcolor: '#4F46E5', color: '#FFF', 
                    boxShadow: '0 4px 10px rgba(79,70,229,0.3)',
                    '&:hover': { bgcolor: '#4338CA' } 
                  }}
                >
                  <input hidden accept="image/*" type="file" onChange={handlePhotoChange} />
                  <CameraIcon fontSize="small" />
                </IconButton>
              }
            >
              <Avatar 
                src={preview} 
                sx={{ 
                  width: 150, height: 150, bgcolor: '#4F46E5', 
                  fontSize: '3.5rem', fontWeight: 900, mx: 'auto',
                  border: '4px solid #FFF', boxShadow: '0 10px 20px rgba(0,0,0,0.08)'
                }}
              >
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </Badge>
            
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 900, color: '#1E293B' }}>
              {formData.name || 'Usuário'}
            </Typography>
            
            <Typography variant="caption" sx={{ 
              color: '#4F46E5', fontWeight: 800, bgcolor: '#EEF2FF', 
              px: 2, py: 0.8, borderRadius: '20px', mt: 1.5, 
              display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {formData.role === 'admin' ? 'Administrador' : 'Freelancer'}
            </Typography>

            <Divider sx={{ my: 4, borderStyle: 'dashed' }} />
            
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ color: '#64748B' }}>
              <InfoIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Membro desde Junho de 2025
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* 2. CARD DA DIREITA (DETALHES DA CONTA) */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ 
            p: 5, borderRadius: '24px', border: '1px solid #E2E8F0', 
            height: '100%', bgcolor: '#FFF', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <Typography variant="subtitle1" sx={{ mb: 4, fontWeight: 900, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: '#4F46E5' }} /> Detalhes da Conta
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth label="Nome Completo" value={formData.name} sx={FIELD_STYLE}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
                  }}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth label="E-mail Corporativo" disabled value={formData.email} sx={DISABLED_FIELD_STYLE}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
                  }}
                />
              </Grid>

              {/* SELETOR DE NÍVEL DE ACESSO ALINHADO */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={FIELD_STYLE}>
                  <InputLabel id="role-select-label">Nível de Acesso</InputLabel>
                  <Select
  labelId="role-select-label"
  value={formData.role}
  label="Nível de Acesso"
  disabled={user?.role !== 'admin'} 
  onChange={(e) => {
    const newRole = e.target.value;
    setFormData({...formData, role: newRole});
    // CHAME A FUNÇÃO DE MUDANÇA AQUI
    handleChangeRole(user.id, newRole); 
  }}
  sx={{ borderRadius: '14px' }}
>
  <MenuItem value="user">Freelancer (User)</MenuItem>
  <MenuItem value="admin">Administrador</MenuItem>
</Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  fullWidth label="Especialidade Profissional" 
                  value={formData.specialty} 
                  sx={FIELD_STYLE}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
                  }}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={BUTTON_STYLE}
                  >
                    {loading ? 'Processando...' : 'Salvar Alterações'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
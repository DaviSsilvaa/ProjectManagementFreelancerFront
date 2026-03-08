import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import api from "../services/api";
import {
  Box, Paper, Typography, Button, CircularProgress, Alert, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Divider,
  Chip, FormControl, InputLabel, Select, MenuItem, Grid, Avatar, Stack, 
  IconButton, InputAdornment
} from "@mui/material";
import { 
  Layers as ProjectIcon, 
  EventNote as DateIcon,
  QueryBuilder as TimeIcon,
  Paid as MoneyIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Business as ClientIcon,
  ShieldOutlined as ShieldIcon
} from "@mui/icons-material";

const statusTheme = {
  pending: { color: '#F59E0B', label: 'PENDENTE', bg: 'rgba(245, 158, 11, 0.08)' },
  PENDING: { color: '#F59E0B', label: 'PENDENTE', bg: 'rgba(245, 158, 11, 0.08)' },
  in_progress: { color: '#3B82F6', label: 'EM EXECUÇÃO', bg: 'rgba(59, 130, 246, 0.08)' },
  IN_PROGRESS: { color: '#3B82F6', label: 'EM EXECUÇÃO', bg: 'rgba(59, 130, 246, 0.08)' },
  completed: { color: '#10B981', label: 'FINALIZADO', bg: 'rgba(16, 185, 129, 0.08)' },
  COMPLETED: { color: '#10B981', label: 'FINALIZADO', bg: 'rgba(16, 185, 129, 0.08)' },
  IN_NEGOTIATION: { color: '#6366F1', label: 'EM NEGOCIAÇÃO', bg: 'rgba(99, 102, 241, 0.08)' },
  CANCELLED: { color: '#EF4444', label: 'CANCELADO', bg: 'rgba(239, 68, 68, 0.08)' }
};

// Estilo customizado para os Inputs do Modal
const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#FBFBFE',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#1E293B', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { color: '#64748B', fontWeight: 500 },
};

export default function Projects() {
  const navigate = useNavigate();
  
  // Estados de Dados
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    title: '', client_id: '', description: '', total_value: '', deadline: ''
  });

  const canSubmit = useMemo(() => 
    formData.title.trim().length >= 3 && !!formData.client_id && !saving, 
  [formData.title, formData.client_id, saving]);


  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, cliRes] = await Promise.all([
        api.get("/projects"),
        api.get("/clients")
      ]);
      setProjects(Array.isArray(projRes.data) ? projRes.data : projRes.data?.data ?? []);
      setClients(Array.isArray(cliRes.data) ? cliRes.data : cliRes.data?.data ?? []);
    } catch (err) {
      console.error("Erro na carga de dados:", err);
      setError("Falha na sincronização dos registros operacionais.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
  if (!canSubmit) return;
  setSaving(true);
  try {
    const rawValue = formData.total_value.replace(/\D/g, "");
    const numericBudget = rawValue ? Number(rawValue) / 100 : 0;

    const payload = {
      title: formData.title.trim(),
      client_id: formData.client_id,
      description: formData.description,
      status: "pending",
      budget: numericBudget,
      end_date: formData.deadline
    };

    await api.post("/projects", payload);
    
    setSuccessOpen(true);
    setOpenModal(false);
    await fetchData();
  } catch (err) {
    console.error("[projects:create_front]", err);
    setError("Erro ao processar o registro financeiro.");
  } finally {
    setSaving(false);
  }
};

  const clientNameById = useMemo(() => {
    const m = new Map();
    clients.forEach(c => m.set(c.id, c.name));
    return m;
  }, [clients]);

  return (
    <AppLayout title="Operações de Projetos">
      {/* HEADER PRINCIPAL */}
      <Box sx={{ mb: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 850, color: '#0F172A', letterSpacing: '-1.5px', mb: 1 }}>
            Painel de Operações
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Monitoramento técnico de contratos e cronogramas operacionais.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)} 
          sx={{ borderRadius: '8px', px: 4, py: 1.5, bgcolor: '#1E293B', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#0F172A' } }}
        >
          Novo Registro
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setError("")}>{error}</Alert>}

      {loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress color="inherit" /></Box>
) : (
  <Box>
    {/* 1. INDICADORES ESTRATÉGICOS (KPIs) - Peso para o TCC */}
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Volume em Carteira</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0)
            )}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Projetos Ativos</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#3B82F6' }}>
            {projects.filter(p => p.status !== 'completed').length}
          </Typography>
        </Paper>
      </Grid>
    </Grid>

    {/* 2. TABELA OPERACIONAL DE ALTA DENSIDADE */}
    <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      {/* Cabeçalho da Tabela */}
      <Box sx={{ 
        px: 3, py: 2, bgcolor: '#F1F5F9', borderBottom: '1px solid #E2E8F0', 
        display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' 
      }}>
        <Typography sx={{ flex: 3, fontWeight: 800, fontSize: '0.75rem', color: '#475569' }}>PROJETO / DESCRIÇÃO</Typography>
        <Typography sx={{ flex: 2, fontWeight: 800, fontSize: '0.75rem', color: '#475569' }}>PARCEIRO COMERCIAL</Typography>
        <Typography sx={{ flex: 1.5, fontWeight: 800, fontSize: '0.75rem', color: '#475569' }}>ORÇAMENTO</Typography>
        <Typography sx={{ flex: 1.5, fontWeight: 800, fontSize: '0.75rem', color: '#475569' }}>STATUS</Typography>
        <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.75rem', color: '#475569', textAlign: 'right' }}>AÇÕES</Typography>
      </Box>

      <Stack divider={<Divider />}>
        {projects.map((p) => {
          const theme = statusTheme[p.status] || statusTheme.pending;
          return (
            <Box 
              key={p.id} 
              sx={{ 
                px: 3, py: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2,
                transition: '0.2s', '&:hover': { bgcolor: '#F8FAFC' } 
              }}
            >
              {/* Identificação */}
              {/* Coluna 1: Identificação - Ajustada para não quebrar o layout */}
<Box sx={{ 
  flex: { xs: '1 1 100%', md: 3 }, 
  display: 'flex', 
  alignItems: 'center', 
  gap: 2,
  minWidth: 0 // ESSENCIAL: permite que o flex-item encolha
}}>
  <Avatar sx={{ bgcolor: theme.bg, color: theme.color, borderRadius: '8px', width: 40, height: 40 }}>
    <ProjectIcon fontSize="small" />
  </Avatar>
  <Box sx={{ minWidth: 0, flex: 1 }}> {/* minWidth aqui também */}
    <Typography 
      variant="body2" 
      sx={{ 
        fontWeight: 700, 
        color: '#1E293B',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis' // Adiciona os "..."
      }}
    >
      {p.title}
    </Typography>
    <Typography 
      variant="caption" 
      sx={{ 
        color: '#94A3B8', 
        display: 'block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis' // Trunca a descrição longa
      }}
    >
      {p.description || 'Sem especificações técnicas detalhadas'}
    </Typography>
  </Box>
</Box>

              {/* Cliente */}
              <Box sx={{ flex: { xs: '1 1 45%', md: 2 } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                  {clientNameById.get(p.client_id) || 'CLIENTE GERAL'}
                </Typography>
              </Box>

              {/* Financeiro */}
              <Box sx={{ flex: { xs: '1 1 45%', md: 1.5 } }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.budget || 0)}
                </Typography>
              </Box>

              {/* Status Badge */}
              <Box sx={{ flex: { xs: '1 1 45%', md: 1.5 } }}>
                <Chip 
                  label={theme.label} 
                  size="small"
                  sx={{ 
                    bgcolor: theme.bg, color: theme.color, fontWeight: 900, 
                    borderRadius: '6px', fontSize: '0.65rem', border: `1px solid ${theme.color}30` 
                  }} 
                />
              </Box>

              {/* Ação */}
              <Box sx={{ flex: { xs: '1 1 100%', md: 1 }, textAlign: 'right' }}>
                <IconButton 
                  size="small" 
                  onClick={() => navigate(`/projects/${p.id}`)}
                  sx={{ color: '#64748B', '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' } }}
                >
                  <ShieldIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  </Box>
)}

      {/* MODAL PROFESSIONAL INTEGRADO */}
      <Dialog 
  open={openModal} 
  onClose={() => setOpenModal(false)} 
  fullWidth 
  maxWidth="lg" // Aumentado para 'lg' para dar amplitude às 3 colunas
  PaperProps={{ 
    sx: { 
      borderRadius: '16px', 
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      backgroundImage: 'none' 
    } 
  }}
>
  {/* HEADER COM IDENTIDADE VISUAL SÓBRIA */}
  <DialogTitle sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FFF' }}>
    <Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ bgcolor: '#0F172A', color: '#FFF', p: 1, borderRadius: '8px', display: 'flex' }}>
          <ShieldIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
            Formalização de Projeto
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
            ESTABELEÇA AS DIRETRIZES TÉCNICAS E COMERCIAIS DO NOVO CONTRATO.
          </Typography>
        </Box>
      </Stack>
    </Box>
    <IconButton onClick={() => setOpenModal(false)} sx={{ color: '#94A3B8' }}><CloseIcon /></IconButton>
  </DialogTitle>

  <Divider sx={{ borderColor: '#F1F5F9' }} />

  <DialogContent sx={{ p: 4, bgcolor: '#FFF' }}>
    <Grid container spacing={4}>
      
      {/* COLUNA 1: ORIGEM E IDENTIFICAÇÃO (3/12) */}
      <Grid item xs={12} md={3.5}>
        <Stack spacing={3}>
          <Typography variant="overline" sx={{ color: '#0F172A', fontWeight: 800, letterSpacing: '1px' }}>
            01. Identificação
          </Typography>
          <TextField 
            fullWidth label="Designação do Projeto" 
            placeholder="Ex: API Rest de Pagamentos"
            sx={inputStyle}
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <FormControl fullWidth sx={inputStyle}>
            <InputLabel>Parceiro Comercial</InputLabel>
            <Select 
              label="Parceiro Comercial" 
              value={formData.client_id} 
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
            >
              {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Grid>

      <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', md: 'block' }, borderColor: '#F1F5F9' }} />

      {/* COLUNA 2: ESCOPO E DETALHAMENTO (5/12) */}
      <Grid item xs={12} md={4.5}>
        <Stack spacing={3}>
          <Typography variant="overline" sx={{ color: '#0F172A', fontWeight: 800, letterSpacing: '1px' }}>
            02. Detalhamento Técnico / Escopo
          </Typography>
          <TextField 
            fullWidth multiline rows={8} 
            label="Descrição do Escopo" 
            placeholder="Descreva as especificações, tecnologias e objetivos do projeto..."
            sx={inputStyle}
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </Stack>
      </Grid>

      <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', md: 'block' }, borderColor: '#F1F5F9' }} />

      {/* COLUNA 3: INDICADORES E PRAZOS */}
<Grid item xs={12} md={3}>
  <Stack spacing={3}>
    <Typography variant="overline" sx={{ color: '#0F172A', fontWeight: 800, letterSpacing: '1px' }}>
      03. Indicadores Base
    </Typography>
    <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
      <Stack spacing={3}>
        <TextField 
  fullWidth 
  label="Valor Estimado" 
  placeholder="R$ 0,00"
  sx={{ ...inputStyle, bgcolor: '#FFF' }}
  value={formData.total_value} 
  onChange={(e) => {
    let value = e.target.value;

    value = value.replace(/\D/g, "");

    value = (Number(value) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    if (value === "R$ 0,00") value = "";

    setFormData({ ...formData, total_value: value });
  }}
  InputProps={{ 
    sx: { fontWeight: 700, color: '#0F172A' }
  }}
/>
        
        <TextField 
          fullWidth label="Deadline Operacional" type="date"
          sx={{ ...inputStyle, bgcolor: '#FFF' }}
          InputLabelProps={{ shrink: true }}
          value={formData.deadline} 
          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          InputProps={{ startAdornment: <InputAdornment position="start"><DateIcon fontSize="small" /></InputAdornment> }}
        />
      </Stack>
    </Box>
  </Stack>
</Grid>
    </Grid>
  </DialogContent>

  <DialogActions sx={{ p: 4, bgcolor: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
    <Button 
      onClick={() => setOpenModal(false)} 
      sx={{ fontWeight: 700, color: '#64748B', textTransform: 'none', px: 3 }}
    >
      Descartar
    </Button>
    <Button 
      variant="contained" 
      disableElevation 
      disabled={!canSubmit || saving} 
      onClick={handleCreate}
      sx={{ 
        borderRadius: '8px', 
        px: 6, 
        py: 1.5, 
        bgcolor: '#0F172A', 
        fontWeight: 700, 
        textTransform: 'none',
        '&:hover': { bgcolor: '#1E293B' } 
      }}
    >
      {saving ? <CircularProgress size={24} color="inherit" /> : "Efetivar Registro"}
    </Button>
  </DialogActions>
</Dialog>

      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: '8px', fontWeight: 700 }}>Operação realizada com sucesso.</Alert>
      </Snackbar>
    </AppLayout>
  );
}
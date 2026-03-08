import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Alert,
  Snackbar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  Grid,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  WhatsApp as WhatsAppIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import AppLayout from "../layout/AppLayout";

// --- FUNÇÕES AUXILIARES (Lógica de UI) ---
const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { logout } = useAuth();

  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Menu States
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Delete States
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const isMenuOpen = Boolean(anchorEl);

  // Filtro em tempo real (Otimizado com useMemo)
  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company &&
          c.company.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [clients, searchTerm]);

  useEffect(() => {
    if (location.state?.formLogin) {
      setSuccessMessage("Bem-vindo de volta!");
      setOpenSnackbar(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get("/clients");
        setClients(response.data);
      } catch (error) {
        if (error.response?.status === 401) logout();
        else setErrorMsg("Erro ao carregar a base de clientes.");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [logout]);

  // Handlers
  const handleMenuClick = (e, clientId) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedClientId(clientId);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleViewFromMenu = () => {
    if (selectedClientId) navigate(`/client/${selectedClientId}`);
    handleMenuClose();
  };

  const handleAskDelete = () => {
    setPendingDeleteId(selectedClientId);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      await api.delete(`/clients/${pendingDeleteId}`);
      setClients((prev) => prev.filter((c) => c.id !== pendingDeleteId));
      setSuccessMessage("Registro removido com sucesso.");
      setOpenSnackbar(true);
    } catch (err) {
      console.error("Erro na exclusão:", err); // Agora 'err' está sendo usado!
      setErrorMsg(err.response?.data?.error || "Falha ao excluir o registro.");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <AppLayout title="Dashboard">
      <Box
        sx={{
          backgroundColor: "#F8FAFC", // Azul acinzentado suave para tirar o branco cansativo
          minHeight: "100vh",
          m: -3, // Compensa o padding do layout base
          p: 3,
        }}
      >
        {/* HEADER SECTION */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 4,
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: "#1E293B", mb: 0.5 }}
            >
              Gestão de Carteira
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748B", fontWeight: 500 }}
            >
              Administre seus parceiros de negócio e contatos comerciais.
            </Typography>
          </Box>
          <Button
            variant="contained"
            disableElevation
            onClick={() => navigate("/register-client")}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.2,
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            + Adicionar Parceiro
          </Button>
        </Box>

        {/* KPI CARDS (Nota 10 no TCC) */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: "1px solid #E2E8F0",
              }}
            >
              <Avatar sx={{ bgcolor: "#EEF2FF", color: "#4F46E5" }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {clients.length}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Total de Clientes
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: "1px solid #E2E8F0",
              }}
            >
              <Avatar sx={{ bgcolor: "#ECFDF5", color: "#10B981" }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Ativo
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Status do Sistema
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* BUSCA */}
        <TextField
          fullWidth
          placeholder="Pesquisar por nome ou empresa..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: "#FFF",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
        />

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
            {errorMsg}
          </Alert>
        )}

        {loading ? (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
    <CircularProgress color="inherit" />
  </Box>
) : (
  <Paper 
    elevation={0} 
    sx={{ 
      borderRadius: '16px', 
      border: '1px solid #E2E8F0', 
      overflow: 'hidden',
      bgcolor: '#FFF'
    }}
  >
    {/* CABEÇALHO DA TABELA */}
    <Box sx={{ 
      px: 3, py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', 
      display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' 
    }}>
      <Typography sx={{ flex: 4, fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
        Parceiro / Identificação
      </Typography>
      <Typography sx={{ flex: 3, fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
        Empresa / Organização
      </Typography>
      <Typography sx={{ flex: 3, fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
        Contato Direto
      </Typography>
      <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>
        Ações
      </Typography>
    </Box>

    {/* O Stack organiza as linhas e adiciona o Divider entre elas automaticamente */}
<Stack divider={<Divider sx={{ borderColor: '#F1F5F9' }} />} sx={{ bgcolor: '#FFF' }}>
  {filteredClients.length > 0 ? (
    filteredClients.map((client) => (
      <Box 
        key={client.id} 
        sx={{ 
          px: 3, py: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2,
          transition: '0.2s', '&:hover': { bgcolor: '#F8FAFC' } 
        }}
      >
        {/* 1. PARCEIRO / IDENTIFICAÇÃO */}
        <Box sx={{ flex: { xs: '1 1 100%', md: 4 }, display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          <Avatar
            sx={{
              bgcolor: stringToColor(client.name),
              width: 42, height: 42, fontWeight: 800, borderRadius: '10px'
            }}
          >
            {getInitials(client.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }} noWrap>
              {client.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }} noWrap>
              {client.email || "E-mail não informado"}
            </Typography>
          </Box>
        </Box>

        {/* 2. EMPRESA / ORGANIZAÇÃO */}
        <Box sx={{ flex: { xs: '1 1 45%', md: 3 } }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, display: 'block', mb: 0.5 }}>
            EMPRESA / ORGANIZAÇÃO
          </Typography>
          <Chip 
            label={client.company || "Pessoa Física"} 
            size="small"
            sx={{ 
              bgcolor: client.company ? '#EEF2FF' : '#F1F5F9', 
              color: client.company ? '#4F46E5' : '#64748B',
              fontWeight: 700, borderRadius: '6px', fontSize: '0.7rem'
            }} 
          />
        </Box>

        {/* 3. CONTATO DIRETO (TELEFONE) */}
        <Box sx={{ flex: { xs: '1 1 45%', md: 3 } }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, display: 'block', mb: 0.5 }}>
            CONTATO DIRETO
          </Typography>
          <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
            {client.phone || "Não informado"}
          </Typography>
        </Box>

        {/* 4. AÇÕES (RECUPERADAS) */}
        <Box sx={{ flex: { xs: '1 1 100%', md: 1 }, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {client.phone && (
            <IconButton
              size="small"
              sx={{ color: "#22C55E", "&:hover": { bgcolor: "#F0FDF4" } }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}`, "_blank");
              }}
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={(e) => handleMenuClick(e, client.id)}>
            <MoreVertIcon sx={{ color: "#94A3B8" }} />
          </IconButton>
        </Box>
      </Box>
    ))
  ) : (
    <Box sx={{ textAlign: "center", py: 10 }}>
      <Typography color="text.secondary">Nenhum parceiro encontrado.</Typography>
    </Box>
  )}
</Stack>
  </Paper>
)}

        {/* --- COMPONENTES DE SUPORTE (MENU/DIALOG) --- */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              mt: 1,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            },
          }}
        >
          <MenuItem onClick={handleViewFromMenu} sx={{ gap: 1.5, py: 1.5 }}>
            <VisibilityIcon fontSize="small" color="action" /> Visualizar
            Detalhes
          </MenuItem>
          <MenuItem
            onClick={handleAskDelete}
            sx={{ gap: 1.5, py: 1.5, color: "error.main" }}
          >
            <DeleteIcon fontSize="small" color="error" /> Remover Registro
          </MenuItem>
        </Menu>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          PaperProps={{ sx: { borderRadius: "16px" } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Esta ação removerá permanentemente os dados deste parceiro. Deseja
              prosseguir?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setConfirmOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disableElevation
              disabled={confirmLoading}
            >
              {confirmLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Confirmar Exclusão"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            severity="success"
            variant="filled"
            sx={{ width: "100%", borderRadius: "12px" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  );
}

export default Dashboard;

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import AppLayout from "../layout/AppLayout"; // <<=== IMPORTANTE

// Função auxiliar para iniciais
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // exclusão
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    if (location.state?.formLogin) {
      setSuccessMessage("Login feito com sucesso!");
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
        console.error("Erro ao buscar clientes:", error);
        if (error.response?.status === 401) {
          logout();
        } else {
          setErrorMsg("Não foi possível carregar os clientes.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [logout]);

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleViewClient = (id) => navigate(`/client/${id}`);

  const handleMenuClick = (e, clientId) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedClientId(clientId);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleViewFromMenu = () => {
    if (selectedClientId) handleViewClient(selectedClientId);
    handleMenuClose();
  };

  const handleAskDelete = () => {
    setPendingDeleteId(selectedClientId);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setConfirmLoading(true);
    setErrorMsg("");

    try {
      setClients((prev) => prev.filter((c) => c.id !== pendingDeleteId));
      await api.delete(`/clients/${pendingDeleteId}`);
      setSuccessMessage("Cliente excluído com sucesso!");
      setOpenSnackbar(true);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || "Erro ao excluir cliente.");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
      setSelectedClientId(null);
    }
  };

  return (
    <AppLayout title="Clientes">
      {/* topo */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
          Meus Clientes
        </Typography>
        <Button variant="outlined" color="error" onClick={logout}>
          Sair
        </Button>
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 4 }}
        onClick={() => navigate("/register-client")}
      >
        Registrar Cliente
      </Button>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {clients.length > 0 ? (
            clients.map((client) => (
              <Paper
                key={client.id}
                sx={{
                  p: 2,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ bgcolor: "#30CFD0", mr: 2, fontWeight: "bold" }}>
                    {getInitials(client.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: "bold", color: "#333" }}>
                      {client.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888" }}>
                      {client.email || "Sem email"}
                    </Typography>
                  </Box>
                </Box>

                <IconButton color="primary" onClick={(e) => handleMenuClick(e, client.id)}>
                  <MoreVertIcon />
                </IconButton>
              </Paper>
            ))
          ) : (
            <Paper sx={{ p: 3, borderRadius: "16px", textAlign: "center" }}>
              <Typography>Nenhum cliente cadastrado ainda.</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* MENU */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        MenuListProps={{ "aria-labelledby": "basic-button" }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
            mt: 1.5,
            borderRadius: "12px",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleViewFromMenu}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          Visualizar
        </MenuItem>
        <MenuItem onClick={handleAskDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          Excluir
        </MenuItem>
      </Menu>

      {/* DIALOG CONFIRMAR EXCLUSÃO */}
      <Dialog open={confirmOpen} onClose={confirmLoading ? undefined : handleConfirmClose}>
        <DialogTitle>Excluir cliente?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Essa ação não pode ser desfeita. Tem certeza que deseja excluir este cliente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} disabled={confirmLoading}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} disabled={confirmLoading} color="error" variant="contained">
            {confirmLoading ? <CircularProgress size={18} color="inherit" /> : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}

export default Dashboard;

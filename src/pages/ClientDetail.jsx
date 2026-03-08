import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Avatar,
  Divider,
  Grid,
  Chip,
  Stack,
} from "@mui/material";
import { Select, MenuItem, FormControl } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Assignment as ProjectIcon,
  AttachMoney as MoneyIcon,
  Schedule as PendingIcon,
  CheckCircle as DoneIcon,
  PlayCircle as ProgressIcon,
} from "@mui/icons-material";
import AppLayout from "../layout/AppLayout";

const stringToColor = (string) => {
  let hash = 0;
  if (!string) return "#30CFD0";
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
  const names = name.trim().split(/\s+/);
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

// Função para estilizar os Status
const getStatusStyles = (status) => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
    case "FINALIZADO":
      return {
        label: "Finalizado",
        color: "#10B981",
        bg: "#ECFDF5",
        icon: <DoneIcon fontSize="small" />,
      };
    case "IN_PROGRESS":
    case "DESENVOLVIMENTO":
      return {
        label: "Em Desenvolvimento",
        color: "#3B82F6",
        bg: "#EFF6FF",
        icon: <ProgressIcon fontSize="small" />,
      };
    case "IN_NEGOTIATION":
      return {
        label: "Em Negociação",
        color: "#6366F1",
        bg: "rgba(99, 102, 241, 0.08)",
        icon: <PendingIcon fontSize="small" />,
      };
    case "CANCELLED":
      return {
        label: "Cancelado",
        color: "#EF4444",
        bg: "rgba(239, 68, 68, 0.08)",
        icon: <CloseIcon fontSize="small" />,
      };
    default:
      return {
        label: "Pendente",
        color: "#F59E0B",
        bg: "#FFFBEB",
        icon: <PendingIcon fontSize="small" />,
      };
  }
};

function ClientDetail() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const formatBRL = (val) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val || 0);

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

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await api.put(`/projects/${projectId}`, { status: newStatus });

      setClient((prev) => ({
        ...prev,
        Projects: prev.Projects.map((p) =>
          p.id === projectId ? { ...p, status: newStatus } : p,
        ),
      }));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const totalFaturado =
    client?.Projects?.reduce(
      (acc, proj) => acc + (Number(proj.budget) || 0),
      0,
    ) || 0;
  const totalProjetos = client?.Projects?.length || 0;

  if (loading)
    return (
      <AppLayout title="Carregando...">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress color="inherit" />
        </Box>
      </AppLayout>
    );

  return (
    <AppLayout title={`Perfil: ${client?.name || "Cliente"}`}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 0 } }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: "#64748B", textTransform: "none", fontWeight: 600 }}
          >
            Voltar
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Editar Perfil
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "24px",
                border: "1px solid #E2E8F0",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: stringToColor(client?.name || ""),
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 2,
                  fontSize: "2rem",
                  fontWeight: 800,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                }}
              >
                {getInitials(client?.name)}
              </Avatar>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#1E293B" }}
              >
                {client?.name}
              </Typography>
              <Chip
                label={client?.company || "Pessoa Física"}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: "#F1F5F9",
                  fontWeight: 600,
                  color: "#475569",
                }}
              />

              <Divider sx={{ my: 3 }} />

              <Stack spacing={2} sx={{ textAlign: "left" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#EEF2FF",
                      color: "#4F46E5",
                      width: 32,
                      height: 32,
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", wordBreak: "break-all" }}
                  >
                    {client?.email || "Não informado"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#ECFDF5",
                      color: "#10B981",
                      width: 32,
                      height: 32,
                    }}
                  >
                    <PhoneIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    {client?.phone || "Não informado"}
                  </Typography>
                </Box>
              </Stack>

              {client?.phone && (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  sx={{
                    mt: 4,
                    borderRadius: "12px",
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: "none",
                    bgcolor: "#22C55E",
                  }}
                  onClick={() =>
                    window.open(
                      `https://wa.me/${client.phone.replace(/\D/g, "")}`,
                      "_blank",
                    )
                  }
                >
                  WhatsApp
                </Button>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "20px",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#FFF7ED", color: "#EA580C" }}>
                      <ProjectIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {totalProjetos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Projetos Realizados
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "20px",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#F0FDF4", color: "#16A34A" }}>
                      <MoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {formatBRL(totalFaturado)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Faturado
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Histórico de Projetos com Status */}
              <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: "24px", border: "1px solid #E2E8F0" }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  Histórico de Projetos
                </Typography>
                {/* Histórico de Projetos com Status - */}
                <Stack spacing={2}>
                  {client?.Projects?.length > 0 ? (
                    client.Projects.map((project) => {
                      const isCancelled = project.status === "CANCELLED"; // Identifica se está cancelado

                      return (
                        <Box
                          key={project.id}
                          sx={{
                            p: 2.5,
                            borderRadius: "16px",
                            border: "1px solid #F1F5F9",
                            bgcolor: "#F8FAFC",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            // ESTILIZAÇÃO PARA NÃO SUMIR:
                            opacity: isCancelled ? 0.7 : 1, // Fica levemente transparente
                            transition: "all 0.3s ease",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 800,
                                color: isCancelled ? "#94A3B8" : "#1E293B", // Muda a cor se cancelado
                                textDecoration: isCancelled
                                  ? "line-through"
                                  : "none", // Risca o nome
                              }}
                            >
                              {project.title} {isCancelled && "(CANCELADO)"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748B" }}
                            >
                              Orçamento: {formatBRL(project.budget)}
                            </Typography>
                          </Box>

                          <FormControl size="small" sx={{ minWidth: 160 }}>
                            <FormControl size="small" sx={{ minWidth: 180 }}>
  <Select
    value={(project.status || "PENDING").toUpperCase()} 
    onChange={(e) => handleStatusChange(project.id, e.target.value)}
    sx={{
      borderRadius: "12px",
      fontSize: "0.75rem",
      fontWeight: 800,
      bgcolor: getStatusStyles(project.status).bg,
      color: getStatusStyles(project.status).color,
      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    }}
  >
    <MenuItem value="PENDING" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Pendente</MenuItem>
    <MenuItem value="IN_NEGOTIATION" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Em Negociação</MenuItem>
    <MenuItem value="IN_PROGRESS" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Em Desenvolvimento</MenuItem>
    <MenuItem value="COMPLETED" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Finalizado</MenuItem>
    <MenuItem value="CANCELLED" sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#EF4444' }}>Cancelado</MenuItem>
  </Select>
</FormControl>
                          </FormControl>
                        </Box>
                      );
                    })
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 2 }}
                    >
                      Nenhum projeto associado a este cliente.
                    </Typography>
                  )}
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: "24px", border: "1px solid #E2E8F0" }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Observações Estratégicas
                </Typography>
                <Box
                  sx={{
                    bgcolor: "#F8FAFC",
                    p: 3,
                    borderRadius: "16px",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#475569",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {client?.notes ||
                      "Nenhuma nota registrada para este parceiro."}
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

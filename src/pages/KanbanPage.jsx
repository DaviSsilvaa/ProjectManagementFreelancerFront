import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import AppLayout from "../layout/AppLayout";
import KanbanBoard from "../components/KanbanBoard";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Container,
  Grid,
  Card,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Divider,
  Button,
  IconButton,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Link
} from "@mui/material";
import {
  Search as SearchIcon,
  AccountBalanceWallet as WalletIcon,
  Assignment as ProjectIcon,
  TrendingUp as GrowthIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import PropTypes from 'prop-types';


const StatCard = ({ title, value, color, icon: IconComponent }) => (
  <Card
    sx={{
      p: 1.5,
      flex: 1.5,
      borderRadius: "16px",
      border: `1px solid ${color}20`,
      bgcolor: "#fff",
      minWidth: "220px",
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          bgcolor: `${color}15`,
          p: 1,
          borderRadius: "12px",
          display: "flex",
          color: color,
        }}
      >
        <IconComponent fontSize="small" /> 
      </Box>
      <Box sx={{ overflow: "hidden" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "#1E293B",
            fontSize: "1.1rem",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  </Card>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
};

export default function KanbanPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const statusConfig = {
  PENDING: { label: 'Pendente', color: '#F59E0B', bg: '#FEF3C7' },
  IN_NEGOTIATION: { label: 'Em Negociação', color: '#6366F1', bg: '#EEF2FF' },
  IN_PROGRESS: { label: 'Em Execução', color: '#3B82F6', bg: '#DBEAFE' },
  COMPLETED: { label: 'Finalizado', color: '#10B981', bg: '#D1FAE5' },
  CANCELLED: { label: 'Cancelado', color: '#EF4444', bg: '#FEE2E2' },
};

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Erro ao carregar projetos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (project) => {
  setSelectedProject(project);
  setModalOpen(true);
};

const handleCloseDetails = () => {
  setModalOpen(false);
  setSelectedProject(null);
};

  useEffect(() => {
    fetchProjects();
  }, []);

  const stats = useMemo(() => {
    const total = projects.reduce((acc, p) => acc + Number(p.budget || 0), 0);
    const active = projects.filter(
      (p) => p.status === "IN_PROGRESS" || p.status === "IN_NEGOTIATION",
    ).length;
    const done = projects.filter((p) => p.status === "COMPLETED").length;

    const format = (v) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);
    return { total: format(total), active, done };
  }, [projects]);

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleStatusChange = async (projectId, newStatus) => {
  const previousProjects = [...projects];

  setProjects(prev => prev.map(p => 
    String(p.id) === String(projectId) ? { ...p, status: newStatus.toUpperCase() } : p
  ));

  try {
    await api.put(`/projects/${projectId}`, { 
      status: newStatus.toUpperCase() 
    });
    console.log("✅ Persistência confirmada.");
  } catch (error) {
    console.error("❌ Erro na persistência do Kanban:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    setProjects(previousProjects);

    const errorMessage = error.response?.data?.error || "Erro de conexão com o servidor.";
    setError(`O card foi revertido: ${errorMessage}`);
  }
};



  if (loading)
    return (
      <AppLayout title="Carregando...">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress color="inherit" />
        </Box>
      </AppLayout>
    );

  const ProjectDetailsModal = ({ open, onClose, project }) => {
  const [tabValue, setTabValue] = useState(0);

  if (!project) return null;

  const formatCurrency = (value) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ 
        sx: { borderRadius: "20px", height: '85vh', display: 'flex', flexDirection: 'column' } 
      }}
    >
      {/* HEADER PADRONIZADO */}
      <Box sx={{ bgcolor: "#4F46E5", p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 800, ml: 1 }}>
          PROJETO #{String(project.id).toUpperCase()}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* NAVEGAÇÃO POR ABAS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#F8FAFC', flexShrink: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, val) => setTabValue(val)}
          sx={{ px: 2, '& .MuiTabs-indicator': { bgcolor: '#4F46E5' } }}
        >
          <Tab label="Visão Geral" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Arquivos" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Timeline" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Comentários" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 4, bgcolor: '#fff', overflowY: 'auto' }}>
        
        {/* ABA 0: VISÃO GERAL */}
        {tabValue === 0 && (
          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: "#1E293B", mb: 1 }}>{project.title}</Typography>
              <Typography variant="body2" color="text.secondary">Dados consolidados e escopo técnico.</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "16px", bgcolor: "#F8FAFC" }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748B" }}>CLIENTE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>{project.client?.name || "Não informado"}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "16px", bgcolor: "#10B98108", borderColor: "#10B98120" }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#059669" }}>ORÇAMENTO</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#059669" }}>{formatCurrency(project.budget)}</Typography>
                </Paper>
              </Grid>
            </Grid>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#4F46E5" }}>DESCRIÇÃO DO ESCOPO</Typography>
              <Paper elevation={0} sx={{ p: 3, mt: 1.5, borderRadius: "16px", bgcolor: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                <Typography variant="body1" sx={{ color: "#334155", whiteSpace: 'pre-line' }}>{project.description || "Sem descrição."}</Typography>
              </Paper>
            </Box>
          </Stack>
        )}

        {/* ABA 1: DOCUMENTOS (LOCAL) */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>📂 Repositório de Documentos</Typography>
            <Grid container spacing={2}>
              {project.ProjectAttachments && project.ProjectAttachments.length > 0 ? (
                project.ProjectAttachments.map((file) => (
                  <Grid item xs={12} sm={6} key={file.id}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px", display: "flex", alignItems: "center", gap: 2, bgcolor: '#F8FAFC' }}>
                      <ProjectIcon sx={{ color: "#4F46E5" }} fontSize="small" />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{file.original_name}</Typography>
                        <Link 
                          href={`http://localhost:3001/files/projects/${file.file_name}`} 
                          target="_blank" 
                          sx={{ fontSize: "0.75rem", fontWeight: 800, textDecoration: 'none', color: '#4F46E5', cursor: 'pointer' }}
                        >
                          BAIXAR ARQUIVO
                        </Link>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Box sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Nenhum anexo encontrado.</Typography>
                </Box>
              )}
            </Grid>
          </Box>
        )}

        {/* ABA 2: TIMELINE REAL */}
        {tabValue === 2 && (
  <Box sx={{ p: 1 }}>
    <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>🕒 Histórico de Operações</Typography>
    <Stack spacing={0}>
      {project.ProjectLogs?.length > 0 ? (
        project.ProjectLogs.map((log, index) => {
          // Lógica para formatar a descrição se for mudança de status
          let displayDescription = log.description;
          
          if (log.action === "MUDANÇA DE STATUS") {
            // Tenta extrair os status da string "O projeto foi movido de X para Y"
            const parts = log.description.split('"');
            if (parts.length >= 4) {
              const oldStatus = statusConfig[parts[1]]?.label || parts[1];
              const newStatus = statusConfig[parts[3]]?.label || parts[3];
              displayDescription = `O projeto avançou de ${oldStatus} para ${newStatus}.`;
            }
          }

          return (
            <Box key={log.id} sx={{ display: 'flex', gap: 2 }}>
              <Stack alignItems="center">
                <Box sx={{ 
                  bgcolor: log.action === 'CRIAÇÃO' ? '#4F46E5' : (statusConfig[project.status]?.color || '#10B981'), 
                  width: 12, height: 12, borderRadius: '50%', mt: 1 
                }} />
                {index !== project.ProjectLogs.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: '#E2E8F0', minHeight: '40px' }} />}
              </Stack>
              <Box sx={{ pb: 4 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E293B' }}>
                  {log.action === "MUDANÇA DE STATUS" ? "Atualização de Fase" : log.action}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {new Date(log.createdAt).toLocaleString('pt-BR')} • <strong>{log.user_name}</strong>
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, mt: 1, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                    {displayDescription}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          );
        })
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 4 }}>
          Nenhum registro de atividade.
        </Typography>
      )}
    </Stack>
  </Box>
)}

        {/* ABA 3: COMENTÁRIOS E NOTAS INTERNAS */}
{tabValue === 3 && (
  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
      💬 Discussão e Notas Técnicas
    </Typography>

    {/* Lista de Comentários */}
    <Box sx={{ 
      flexGrow: 1, 
      mb: 2, 
      overflowY: 'auto', 
      bgcolor: '#F8FAFC', 
      borderRadius: '16px', 
      p: 2, 
      border: '1px solid #E2E8F0',
      maxHeight: '350px'
    }}>
      {project.ProjectComments && project.ProjectComments.length > 0 ? (
        <Stack spacing={2}>
          {project.ProjectComments.map((comment) => (
            <Box key={comment.id} sx={{ alignSelf: 'flex-start', maxWidth: '90%' }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: '12px 12px 12px 4px', bgcolor: '#fff', border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#4F46E5' }}>
                  {comment.user_name} • {new Date(comment.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', mt: 0.5 }}>
                  {comment.content}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Stack>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
          <Typography variant="body2">Nenhuma nota registrada para este projeto.</Typography>
        </Box>
      )}
    </Box>

    {/* Campo de Inserção */}
    <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
      <TextField
        fullWidth
        multiline
        maxRows={3}
        placeholder="Escreva uma observação técnica..."
        sx={{ 
          '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' }
        }}
      />
      <Button 
        variant="contained" 
        sx={{ bgcolor: '#4F46E5', borderRadius: '12px', px: 3, fontWeight: 700 }}
      >
        Enviar
      </Button>
    </Stack>
  </Box>
)}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
        <Button fullWidth variant="contained" onClick={onClose} sx={{ bgcolor: "#4F46E5", borderRadius: "12px", fontWeight: 800, py: 1.5 }}>
          FECHAR VISUALIZAÇÃO
        </Button>
      </DialogActions>
    </Dialog>
  );
};

  return (
    <AppLayout title="Gestão Operacional">
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: "12px" }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 4 }} alignItems="stretch">
          <Grid item xs={12} lg={8}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ h: "100%" }}
            >
              <StatCard
                title="Volume em Carteira"
                value={stats.total}
                color="#4F46E5"
                icon={WalletIcon}
              />
              <StatCard
                title="Projetos Ativos"
                value={stats.active}
                color="#F59E0B"
                icon={ProjectIcon}
              />
              <StatCard
                title="Concluídos"
                value={stats.done}
                color="#10B981"
                icon={GrowthIcon}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: "16px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: "text.secondary",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <FilterIcon sx={{ fontSize: 14 }} /> PESQUISA RÁPIDA
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Cliente ou projeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#4F46E5", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "#F8FAFC",
                  },
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "24px",
                border: "1px solid #E2E8F0",
                bgcolor: "#fff",
                minHeight: "75vh",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)",
              }}
            >
              <Box
                sx={{
                  mb: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 900, color: "#1E293B" }}
                  >
                    Fluxo de Trabalho
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gerenciamento visual de entregas e orçamentos
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: "#4F46E510",
                    color: "#4F46E5",
                    px: 2,
                    py: 1,
                    borderRadius: "10px",
                    fontWeight: 800,
                    border: "1px solid #4F46E520",
                  }}
                >
                  {filteredProjects.length} PROJETOS ENCONTRADOS
                </Typography>
              </Box>

              <KanbanBoard
                projects={filteredProjects}
                onStatusChange={handleStatusChange}
                onProjectClick={handleOpenDetails}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* MODAL DE DETALHES ADICIONADO AQUI */}
      <ProjectDetailsModal 
        open={modalOpen} 
        onClose={handleCloseDetails} 
        project={selectedProject} 
      />
    </AppLayout>
  );
}

// DEFINIÇÃO DO COMPONENTE (Mantenha fora da função principal)
const ProjectDetailsModal = ({ open, onClose, project }) => {
  if (!project) return null;

  const formatCurrency = (value) => 
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: "20px", p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 900, color: "#1E293B", fontSize: "1.5rem" }}>
        Detalhes do Projeto
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>TÍTULO</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#4F46E5" }}>{project.title}</Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>CLIENTE</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{project.client?.name || "Não informado"}</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>ORÇAMENTO</Typography>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 800 }}>
                {formatCurrency(project.budget || 0)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>STATUS ATUAL</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip 
                  label={project.status.replace("_", " ")} 
                  size="small" 
                  color="primary" 
                  sx={{ fontWeight: 700, borderRadius: "8px" }} 
                />
              </Box>
            </Grid>
          </Grid>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>DESCRIÇÃO DO ESCOPO</Typography>
            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
              {project.description || "Nenhuma descrição detalhada fornecida para este projeto."}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

ProjectDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.object
};

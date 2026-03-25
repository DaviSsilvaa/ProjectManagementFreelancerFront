import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import api from "../services/api";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Stack,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Description as ScopeIcon,
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { generateProjectPDF } from "../services/ProjectReportService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

const formatBRL = (val) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    val || 0,
  );

const statusTheme = {
  PENDING: { label: "PENDENTE", color: "#F59E0B" },
  IN_PROGRESS: { label: "EM EXECUÇÃO", color: "#3B82F6" },
  COMPLETED: { label: "FINALIZADO", color: "#10B981" },
  IN_NEGOTIATION: { label: "EM NEGOCIAÇÃO", color: "#6366F1" },
  CANCELLED: { label: "CANCELADO", color: "#EF4444" },
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#F8FAFC", 
    transition: "all 0.2s ease-in-out",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { 
      borderColor: "#4F46E5",
      borderWidth: "2px" 
    },
  },
  "& .MuiInputLabel-root": { 
    color: "#64748B", 
    fontWeight: 500 
  }
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    budget: "",
  });
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    attachmentId: null,
    fileName: "",
  });
  const [notify, setNotify] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpenDeleteModal = (id, name) => {
    setDeleteModal({ open: true, attachmentId: id, fileName: name });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ open: false, attachmentId: null, fileName: "" });
  };

  const handleCloseNotify = (event, reason) => {
    if (reason === "clickaway") return;
    setNotify({ ...notify, open: false });
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await api.post(`/projects/${id}/analyze`, {
        title: project.title,
        description: project.description,
        budget: project.budget,
        clientName: project.client?.name,
      });
      setAiResult(res.data);
    } catch (err) {
      console.error("Erro na consultoria IA:", err);
      alert("Não foi possível obter a análise no momento.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await api.delete(`/attachments/${attachmentId}`);

      setProject((prev) => ({
        ...prev,
        ProjectAttachments: prev.ProjectAttachments.filter(
          (a) => a.id !== attachmentId,
        ),
      }));

      const resAudit = await api.get(`/attachments/audit/${id}`);
      setAuditLogs(resAudit.data);

      setNotify({
        open: true,
        message: "Arquivo removido permanentemente. Auditoria atualizada!",
        severity: "warning",
      });
    } catch (err) {
      console.error("Erro ao excluir:", err);
      setNotify({
        open: true,
        message: "Falha na exclusão. O erro foi reportado à segurança.",
        severity: "error",
      });
    }
  };

  const handleOpenEdit = () => {
  setEditForm({
    title: project.title,
    description: project.description,
    status: project.status, 
    budget: new Intl.NumberFormat("pt-BR", { 
      style: "currency", 
      currency: "BRL" 
    }).format(project.budget)
  });
  setOpenEdit(true);
};

  const handleUpdateProject = async () => {
  try {
    // Remove R$, pontos e vírgulas para mandar só o número para o banco
    const rawValue = editForm.budget.replace(/\D/g, "");
    const numericBudget = Number(rawValue) / 100;

    const res = await api.put(`/projects/${id}`, {
      title: editForm.title,
      description: editForm.description,
      status: editForm.status,
      budget: numericBudget // Envia como número: 50000.00
    });

    setProject(res.data);
    setOpenEdit(false);
    
    // Dispara a SnackBar de sucesso igual à da sua primeira imagem!
    setNotify({
      open: true,
      message: "Dados do projeto atualizados com sucesso!",
      severity: "success"
    });
  } catch (err) {
    setNotify({ open: true, message: "Erro ao salvar.", severity: "error" });
  }
};

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    const fetchAudit = async () => {
      const res = await api.get(`/attachments/audit/${id}`);
      setAuditLogs(res.data);
    };
    fetchAudit();
  }, [id]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await api.post(`/attachments/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProject((prev) => ({
        ...prev,
        ProjectAttachments: [...(prev.ProjectAttachments || []), response.data],
      }));

      setNotify({
        open: true,
        message: "Arquivo enviado e registrado com sucesso!",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setNotify({
        open: true,
        message:
          "Erro ao enviar arquivo. Verifique a conexão ou permissões da pasta.",
        severity: "error",
      });
    } finally {
      setUploading(false);
      event.target.value = null;
    }
  };

  if (loading)
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress color="inherit" />
        </Box>
      </AppLayout>
    );

  return (
    <AppLayout title={`Gestão de Projeto: ${project?.title}`}>
      <Box sx={{ width: "100%", px: { xs: 2, md: 4 }, py: 3 }}>
        {/* 1. CABEÇALHO E NAVEGAÇÃO (BREADCRUMBS) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
          }}
        >
          <Box>
            <Breadcrumbs sx={{ mb: 1 }}>
              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigate("/projects")}
                sx={{ cursor: "pointer", fontWeight: 500 }}
              >
                Projetos
              </Link>
              <Typography color="text.primary" sx={{ fontWeight: 700 }}>
                Detalhes do Contrato
              </Typography>
            </Breadcrumbs>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, color: "#0F172A", letterSpacing: "-1px" }}
            >
              {project?.title}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={() => generateProjectPDF(project, aiResult)}
              variant="outlined"
              sx={{
                borderRadius: "10px",
                fontWeight: 700,
                textTransform: "none",
                borderColor: "#E2E8F0",
                color: "#1E293B",
              }}
            >
              Exportar Relatório PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleOpenEdit}
              sx={{
                bgcolor: "#4F46E5",
                borderRadius: "10px",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#4338CA" },
              }}
            >
              Editar Escopo
            </Button>
          </Stack>
        </Box>

        {/* 2. DASHBOARD DE INDICADORES (KPIs) */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: "20px",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFF",
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  fontWeight: 800,
                  display: "block",
                  mb: 0.5,
                }}
              >
                VALOR DO CONTRATO
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 900, color: "#10B981" }}
              >
                {formatBRL(project?.budget)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  fontWeight: 800,
                  display: "block",
                  mb: 0.5,
                }}
              >
                PARCEIRO COMERCIAL
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 700, color: "#1E293B" }}
              >
                {project?.client?.name || "Cliente não vinculado"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  fontWeight: 800,
                  display: "block",
                  mb: 0.5,
                }}
              >
                DATA DE ABERTURA
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {new Date(project?.createdAt).toLocaleDateString("pt-BR")}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ textAlign: { sm: "right" } }}>
              {(() => {
                const statusKey = project?.status?.toUpperCase() || "PENDING";
                const config = statusTheme[statusKey] || statusTheme.PENDING;

                return (
                  <Chip
                    label={config.label}
                    sx={{
                      fontWeight: 900,
                      borderRadius: "8px",
                      bgcolor: config.color,
                      color: "#FFF",
                      px: 1,
                    }}
                  />
                );
              })()}
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* 3. COLUNA PRINCIPAL (ESCOPO E ARQUIVOS) */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* BLOCO: DETALHAMENTO DO ESCOPO */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: "20px",
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFF",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <ScopeIcon sx={{ color: "#4F46E5" }} /> Especificações
                  Técnicas
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-line",
                    color: "#334155",
                    lineHeight: 1.8,
                  }}
                >
                  {project?.description ||
                    "Aguardando preenchimento do detalhamento técnico."}
                </Typography>
              </Paper>

              {/* BLOCO: GESTÃO DE DOCUMENTOS */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: "20px",
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFF",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  📂 Repositório de Documentos
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      component="label"
                      fullWidth
                      sx={{
                        border: "2px dashed #CBD5E1",
                        py: 4,
                        borderRadius: "16px",
                        flexDirection: "column",
                        gap: 1,
                        color: "#64748B",
                        "&:hover": {
                          bgcolor: "#F8FAFC",
                          borderColor: "#4F46E5",
                        },
                      }}
                    >
                      {uploading ? (
                        <CircularProgress size={32} color="inherit" />
                      ) : (
                        <UploadIcon sx={{ fontSize: 40 }} />
                      )}
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {uploading ? "SINCRONIZANDO..." : "ENVIAR NOVO ARQUIVO"}
                      </Typography>
                      <input type="file" hidden onChange={handleFileUpload} />
                    </Button>
                  </Grid>

                  {project?.ProjectAttachments?.map((file) => (
                    <Grid item xs={12} sm={6} key={file.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          bgcolor: "#F8FAFC",
                        }}
                      >
                        <FileIcon sx={{ color: "#4F46E5" }} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700 }}
                            noWrap
                          >
                            {file.original_name}
                          </Typography>
                          <Link
                            href={`http://localhost:3001/files/projects/${file.file_name}`}
                            target="_blank"
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              textDecoration: "none",
                            }}
                          >
                            Baixar Arquivo
                          </Link>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleOpenDeleteModal(file.id, file.original_name)
                          }
                          sx={{ color: "#E11D48" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* 4. COLUNA LATERAL (INTELIGÊNCIA E SEGURANÇA) */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* CARD: IA CONSULTORIA (Destaque Roxo) */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  bgcolor: "#F5F3FF",
                  border: "1px solid #C4B5FD",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    color: "#7C3AED",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  ✨ FREELA.AI INSIGHTS
                </Typography>

                {aiResult ? (
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#FFF",
                        borderRadius: "12px",
                        border: "1px solid #DDD6FE",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, color: "#7C3AED" }}
                      >
                        ANÁLISE FINANCEIRA
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: "#4C1D95",
                          fontSize: "0.85rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {aiResult.viabilidade_financeira}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#FFF",
                        borderRadius: "12px",
                        border: "1px solid #DDD6FE",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, color: "#059669" }}
                      >
                        RECOMENDAÇÃO
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: "#065F46", fontSize: "0.85rem" }}
                      >
                        {aiResult.alerta_margem_lucro}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "#6D28D9", fontStyle: "italic", mb: 2 }}
                  >
                    Solicite uma avaliação inteligente do escopo para detectar
                    riscos e oportunidades.
                  </Typography>
                )}

                <Button
                  fullWidth
                  onClick={handleAIAnalysis}
                  disabled={aiLoading}
                  variant="contained"
                  sx={{
                    bgcolor: "#7C3AED",
                    fontWeight: 800,
                    mt: 2,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#6D28D9" },
                  }}
                >
                  {aiLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Iniciar Consultoria IA"
                  )}
                </Button>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  bgcolor: "#FFF1F2",
                  border: "1px solid #FDA4AF",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, mb: 2, color: "#E11D48" }}
                >
                  🛡️ LOGS DE SEGURANÇA (AUDIT)
                </Typography>
                <Stack spacing={1.5}>
                  {auditLogs.slice(0, 5).map((log) => (
                    <Box
                      key={log.id}
                      sx={{
                        p: 1.5,
                        bgcolor: "#FFF",
                        borderRadius: "10px",
                        border: "1px solid #FECDD3",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: "#BE123C",
                          display: "block",
                        }}
                      >
                        {log.action} •{" "}
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#94A3B8", fontWeight: 500 }}
                      >
                        Sessão IP: {log.ip_address}
                      </Typography>
                    </Box>
                  ))}
                  {auditLogs.length === 0 && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#E11D48", fontStyle: "italic" }}
                    >
                      Nenhuma atividade suspeita registrada.
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={deleteModal.open}
        onClose={handleCloseDeleteModal}
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#0F172A" }}>
          Confirmar Exclusão?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#64748B", fontWeight: 500 }}>
            Você está removendo <strong>{deleteModal.fileName}</strong>{" "}
            permanentemente. Esta ação será registrada na trilha de auditoria.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={handleCloseDeleteModal}
            sx={{ color: "#64748B", fontWeight: 700 }}
          >
            Desistir
          </Button>
          <Button
            onClick={() => {
              handleDeleteAttachment(deleteModal.attachmentId);
              handleCloseDeleteModal();
            }}
            variant="contained"
            sx={{
              bgcolor: "#E11D48",
              fontWeight: 700,
              borderRadius: "8px",
              "&:hover": { bgcolor: "#BE123C" },
            }}
          >
            Confirmar Remoção
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notify.open}
        autoHideDuration={4000}
        onClose={handleCloseNotify}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotify}
          severity={notify.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "12px",
            fontWeight: 700,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
          }}
        >
          {notify.message}
        </Alert>
      </Snackbar>
      <Dialog 
  open={openEdit} 
  onClose={() => setOpenEdit(false)} 
  fullWidth 
  maxWidth="md"
  PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
>
  <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, color: "#0F172A", display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <EditIcon sx={{ color: "#4F46E5" }} /> Editar Informações do Contrato
      </Typography>
      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
        ALTERAÇÕES NO ESCOPO SERÃO REGISTRADAS NO HISTÓRICO DE AUDITORIA.
      </Typography>
    </Box>
    <IconButton onClick={() => setOpenEdit(false)}><CloseIcon /></IconButton>
  </DialogTitle>

  <DialogContent dividers sx={{ borderTop: '1px solid #F1F5F9', p: 4, display: 'flex', justifyContent: 'center' }}>
  <Grid 
    container 
    spacing={4} 
    sx={{ maxWidth: '900px', width: '100%', alignItems: 'stretch' }}
  >
    {/* LADO ESQUERDO: TEXTOS */}
    <Grid item xs={12} md={7}>
      <Stack spacing={3} sx={{ height: '100%', justifyContent: 'center' }}>
        <TextField
          fullWidth
          label="Designação do Projeto"
          value={editForm.title}
          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          sx={inputStyle}
        />
        <TextField
          fullWidth
          multiline
          rows={10} 
          label="Detalhamento Técnico (Escopo)"
          value={editForm.description}
          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          sx={inputStyle}
        />
      </Stack>
    </Grid>

    <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center' }}>
      <Stack 
        spacing={3} 
        sx={{ 
          p: 3, 
          bgcolor: "#F8FAFC", 
          borderRadius: "16px", 
          border: "1px solid #E2E8F0",
          width: '100%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#475569", textTransform: 'uppercase', textAlign: 'center' }}>
          Status e Financeiro
        </Typography>
        
        <FormControl fullWidth sx={inputStyle}>
          <InputLabel>Status do Projeto</InputLabel>
          <Select
            value={editForm.status}
            label="Status do Projeto"
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
          >
            <MenuItem value="PENDING">Pendente</MenuItem>
            <MenuItem value="IN_NEGOTIATION">Em Negociação</MenuItem>
            <MenuItem value="IN_PROGRESS">Em Execução</MenuItem>
            <MenuItem value="COMPLETED">Finalizado</MenuItem>
            <MenuItem value="CANCELLED">Cancelado</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Valor do Contrato"
          value={editForm.budget}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");
            const formattedValue = (Number(value) / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
            setEditForm({ ...editForm, budget: value === "" ? "" : formattedValue });
          }}
          InputProps={{
            sx: { fontWeight: 800, color: "#10B981", fontSize: "1.2rem", textAlign: 'center' }
          }}
          sx={inputStyle}
        />

        <Alert severity="info" sx={{ borderRadius: "10px", fontSize: "0.75rem" }}>
          Mudar o status para <b>Finalizado</b> arquivará o projeto.
        </Alert>
      </Stack>
    </Grid>
  </Grid>
</DialogContent>

  <DialogActions sx={{ p: 3, bgcolor: "#F8FAFC" }}>
    <Button 
      onClick={() => setOpenEdit(false)} 
      sx={{ color: "#64748B", fontWeight: 700, textTransform: 'none' }}
    >
      Descartar Alterações
    </Button>
    <Button 
      onClick={handleUpdateProject} 
      variant="contained" 
      sx={{ 
        bgcolor: "#4F46E5", 
        px: 6, 
        py: 1.2,
        borderRadius: "12px", 
        fontWeight: 800,
        textTransform: 'none',
        '&:hover': { bgcolor: '#4338CA' }
      }}
    >
      Confirmar Atualização
    </Button>
  </DialogActions>
</Dialog>
    </AppLayout>
  );
}

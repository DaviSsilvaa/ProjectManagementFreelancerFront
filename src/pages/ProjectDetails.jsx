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
  Alert
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Description as ScopeIcon,
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
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

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
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

      // Atualiza a lista na UI
      setProject((prev) => ({
        ...prev,
        ProjectAttachments: prev.ProjectAttachments.filter(
          (a) => a.id !== attachmentId,
        ),
      }));

      // Atualiza os logs na tela para mostrar a exclusão no histórico
      const resAudit = await api.get(`/attachments/audit/${id}`);
      setAuditLogs(resAudit.data);

      // NOTIFICAÇÃO LARANJA (Aviso de exclusão)
      setNotify({
        open: true,
        message: "Arquivo removido permanentemente. Auditoria atualizada!",
        severity: "warning", // <--- Laranja vibrante
      });

    } catch (err) {
      console.error("Erro ao excluir:", err);
      // NOTIFICAÇÃO VERMELHA (Falha crítica)
      setNotify({
        open: true,
        message: "Falha na exclusão. O erro foi reportado à segurança.",
        severity: "error",
      });
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
        severity: "success"
      })

    } catch (err) {
      console.error(err);
      setNotify({
        open: true,
        message: "Erro ao enviar arquivo. Verifique a conexão ou permissões da pasta.",
        severity: "error",
      })
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
    <AppLayout title={`Detalhes: ${project?.title}`}>
      <Box sx={{ width: "100%", px: { xs: 2, md: 4 }, py: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Breadcrumbs sx={{ mb: 1 }}>
              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigate("/dashboard/projects")}
                sx={{ cursor: "pointer" }}
              >
                Projetos
              </Link>
              <Typography color="text.primary" sx={{ fontWeight: 700 }}>
                {project?.title}
              </Typography>
            </Breadcrumbs>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#0F172A" }}>
              {project?.title}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            sx={{ bgcolor: "#1E293B", borderRadius: "10px", fontWeight: 700 }}
          >
            Editar Projeto
          </Button>
        </Box>

        {/* 1. GRID DE RESUMO (Ocupa a largura total) */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFF",
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Typography
                variant="caption"
                sx={{ color: "#94A3B8", fontWeight: 800 }}
              >
                ORÇAMENTO TOTAL
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {formatBRL(project?.budget)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography
                variant="caption"
                sx={{ color: "#94A3B8", fontWeight: 800 }}
              >
                CLIENTE RELACIONADO
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {project?.client?.name || "Não vinculado"}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { sm: "flex-end" },
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: "8px",
                  bgcolor: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid #F59E0B",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#B45309", fontWeight: 800 }}
                >
                  {project?.status?.toUpperCase()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* COLUNA DA ESQUERDA (8.5) */}
          <Grid item xs={12} md={8.5}>
            <Stack spacing={3}>
              {/* Escopo */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: "16px",
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
                  <ScopeIcon sx={{ color: "#94A3B8" }} /> Detalhamento do Escopo
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "pre-line", color: "#334155" }}
                >
                  {project?.description}
                </Typography>
              </Paper>

              {/* Documentos e Anexos */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFF",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  📂 Documentos e Anexos
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      disabled={uploading}
                      sx={{
                        borderStyle: "dashed",
                        py: 3,
                        borderRadius: "12px",
                        flexDirection: "column",
                        gap: 1,
                        borderColor: uploading ? "#CBD5E1" : "#94A3B8",
                        color: "#64748B",
                      }}
                    >
                      {uploading ? (
                        <CircularProgress
                          size={32}
                          sx={{ mb: 1 }}
                          color="inherit"
                        />
                      ) : (
                        <UploadIcon sx={{ fontSize: 32 }} />
                      )}
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {uploading ? "ENVIANDO..." : "ANEXAR ARQUIVO"}
                      </Typography>
                      <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </Button>
                  </Grid>
                  {project?.ProjectAttachments?.map((file) => (
                    <Grid item xs={12} sm={6} md={4} key={file.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: "12px",
                          bgcolor: "#F8FAFC",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <FileIcon color="action" />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
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
                            sx={{ fontSize: "0.75rem", fontWeight: 700, mr: 2 }}
                          >
                            Visualizar
                          </Link>
                        </Box>
                        {/* BOTÃO DE EXCLUIR */}
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleOpenDeleteModal(file.id, file.original_name)
                          }
                          sx={{
                            color: "#E11D48",
                            "&:hover": { bgcolor: "#FFF1F2" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Auditoria de Segurança */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid #FDA4AF",
                  bgcolor: "#FFF1F2",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    color: "#E11D48",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  🛡️ AUDITORIA DE SEGURANÇA
                </Typography>
                <Stack spacing={2}>
                  {auditLogs.map((log) => (
                    <Box
                      key={log.id}
                      sx={{
                        p: 2,
                        bgcolor: "#FFF",
                        borderRadius: "8px",
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
                        {log.action} —{" "}
                        {new Date(log.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Arquivo:{" "}
                        <strong>{log.ProjectAttachment?.original_name}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rastro IP: {log.ip_address}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* COLUNA DA DIREITA (LATERAL - 3.5) */}
          {/* COLUNA DA DIREITA (LATERAL) - Ajustada para estabilidade em 100% de zoom */}
<Grid item xs={12} md={4} lg={3.5}> 
  <Stack spacing={3} sx={{ width: "100%" }}>
    
    {/* SEÇÃO DA IA (DAVI-AI) */}
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        border: "1px solid #C4B5FD",
        bgcolor: "#F5F3FF",
        display: "flex",
        flexDirection: "column"
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
        ✨ CONSULTORIA INTELIGENTE
      </Typography>

      <Box sx={{ mb: 2 }}>
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
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#7C3AED" }}>
                💰 ANÁLISE FINANCEIRA
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "#4C1D95", fontSize: "0.85rem", wordBreak: "break-word" }}>
                {aiResult.analise_cliente}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" sx={{ color: "#6D28D9", fontWeight: 700 }}>
                DICA: {aiResult.alerta_margem_lucro}
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
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#BE123C" }}>
                ⚠️ RISCOS IDENTIFICADOS
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "#334155", fontSize: "0.85rem", wordBreak: "break-word" }}>
                {aiResult.viabilidade_financeira}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: "#7C3AED", fontStyle: "italic" }}>
            Analise este projeto com base no perfil do cliente e viabilidade financeira.
          </Typography>
        )}
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={handleAIAnalysis}
        disabled={aiLoading}
        sx={{
          mt: "auto",
          bgcolor: "#7C3AED",
          fontWeight: 800,
          textTransform: "none",
          "&:hover": { bgcolor: "#6D28D9" },
        }}
      >
        {aiLoading ? <CircularProgress size={24} color="inherit" /> : "Gerar Insights"}
      </Button>
    </Paper>

    {/* SEÇÃO DE LOGS E PDF */}
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        bgcolor: "#FFF",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: "#64748B" }}>
        LOGS DE SISTEMA
      </Typography>
      
      <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", mb: 2 }}>
        <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700 }}>
          ENTRADA NO SISTEMA
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {new Date(project?.createdAt).toLocaleDateString()}
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={() => generateProjectPDF(project, aiResult)}
        sx={{
          bgcolor: "#0F172A",
          color: "#FFF",
          fontWeight: 800,
          textTransform: "none",
        }}
      >
        Gerar Relatório PDF
      </Button>
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
          Deseja excluir este arquivo?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#64748B", fontWeight: 500 }}>
            Você está prestes a excluir <strong>{deleteModal.fileName}</strong>.
            Esta ação não pode ser desfeita e um log de auditoria será
            registrado com seu IP e timestamp.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={handleCloseDeleteModal}
            sx={{ color: "#64748B", fontWeight: 700 }}
          >
            Cancelar
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
            Excluir Permanentemente
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
  open={notify.open} 
  autoHideDuration={4000} 
  onClose={handleCloseNotify}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Alert 
    onClose={handleCloseNotify} 
    severity={notify.severity} 
    variant="filled" 
    sx={{ 
      width: '100%', 
      borderRadius: '12px', 
      fontWeight: 700,
      backgroundColor: 
        notify.severity === 'success' ? '#2e7d32' : 
        notify.severity === 'warning' ? '#ed6c02' :
        '#d32f2f',
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)" 
    }}
  >
    {notify.message}
  </Alert>
</Snackbar>
    </AppLayout>
  );
}

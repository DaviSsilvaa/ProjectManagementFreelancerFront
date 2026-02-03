import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import api from "../services/api";
import {
  Box, Typography, Button, CircularProgress, Grid, Paper, 
  Divider, Stack, Breadcrumbs, Link
} from "@mui/material";
import { 
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Description as ScopeIcon
} from "@mui/icons-material";
import { generateProjectPDF } from "../services/ProjectReportService";

const formatBRL = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <AppLayout><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="inherit" /></Box></AppLayout>
  );

  return (
    <AppLayout title={`Detalhes: ${project?.title}`}>
      {/* BOX PRINCIPAL FULL-WIDTH */}
      <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, py: 3 }}>
        
        {/* HEADER DE AÇÕES */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Breadcrumbs sx={{ mb: 1 }}>
              <Link underline="hover" color="inherit" onClick={() => navigate('/dashboard/projects')} sx={{ cursor: 'pointer', fontWeight: 500 }}>
                Projetos
              </Link>
              <Typography color="text.primary" sx={{ fontWeight: 700 }}>{project?.title}</Typography>
            </Breadcrumbs>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>
              {project?.title}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button 
              startIcon={<BackIcon />} 
              onClick={() => navigate('/dashboard/projects')} 
              sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none', px: 3 }}
            >
              Voltar
            </Button>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />} 
              sx={{ bgcolor: '#1E293B', borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, '&:hover': { bgcolor: '#0F172A' } }}
            >
              Editar Projeto
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* 1. BANNER DE RESUMO (KPIs) - SEMPRE NO TOPO FULL WIDTH */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={4} divider={<Divider orientation="vertical" flexItem />}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>Orçamento Total</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>{formatBRL(project?.budget)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>Cliente Relacionado</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>{project?.client?.name || 'Não vinculado'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>Prazo de Entrega</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>
                     {project?.end_date ? new Date(project.end_date).toLocaleDateString() : 'Sem data definida'}
                  </Typography>
                </Box>
              </Stack>
              <Grid marginLeft={2}>
              <Box sx={{ px: 3, py: 1, borderRadius: '8px', bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #F59E0B' }}>
                <Typography variant="subtitle2" sx={{ color: '#B45309', fontWeight: 800 }}>
                  {project?.status?.toUpperCase() || 'PENDENTE'}
                </Typography>
              </Box>
              </Grid>
            </Paper>
            {/* 2. DETALHAMENTO DO ESCOPO (LADO ESQUERDO) */}
          <Grid item xs={12} md={8.5} marginTop={3}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFF', minHeight: '400px' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ScopeIcon sx={{ color: '#94A3B8' }} /> Detalhamento do Escopo e Notas Técnicas
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ whiteSpace: 'pre-line', color: '#334155', lineHeight: 1.8, fontSize: '1.05rem' }}>
                {project?.description || "Nenhum detalhamento técnico registrado para este projeto."}
              </Box>
            </Paper>
          </Grid>
          </Grid>

          

          {/* 3. WIDGETS LATERAIS (LADO DIREITO) */}
          <Grid item xs={12} md={3.5}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#64748B' }}>LOGS DE ATIVIDADE</Typography>
                <Stack spacing={2}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>CRIAÇÃO</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Projeto registrado em {new Date(project?.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>ÚLTIMA ATUALIZAÇÃO</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(project?.updatedAt).toLocaleDateString()}</Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#1E293B', color: '#FFF' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Precisa de ajuda?</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>Gere relatórios de progresso para este cliente.</Typography>
                <Button 
  fullWidth 
  variant="contained" 
  onClick={() => generateProjectPDF(project)} // Chamada direta do serviço
  sx={{ bgcolor: '#FFF', color: '#1E293B', fontWeight: 800 }}
>
  Gerar Relatório PDF
</Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
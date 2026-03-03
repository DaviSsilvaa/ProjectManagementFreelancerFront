import React, { useEffect, useState } from "react";
import AppLayout from "../layout/AppLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Grid, Paper, Typography, Box, Container } from "@mui/material";
import api from "../services/api";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444"];

const CARD_SX = {
  p: 3,
  borderRadius: "20px",
  bgcolor: "#FFF",
  border: "1px solid #E2E8F0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)",
  },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 1.5,
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#64748B", fontWeight: 800 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: "#1E293B", fontWeight: 700 }}>
          {payload[0].value} Clientes
        </Typography>
      </Paper>
    );
  }
  return null;
};

export default function DashboardCharts() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ series: [], pie: [], bars: [], kpis: {} });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/clients");
        const clients = res.data || [];

        setData({
          series: [
            { name: "Jan", clientes: 4 },
            { name: "Fev", clientes: 7 },
            { name: "Mar", clientes: 5 },
            { name: "Abr", clientes: 12 },
          ],
          pie: [
            { name: "Ativos", value: clients.length },
            { name: "Finalizados", value: 3 },
          ],
          bars: [
            { name: "Indicação", qty: 8 },
            { name: "Instagram", qty: 15 },
            { name: "Site", qty: 10 },
          ],
          kpis: { total: clients.length, grow: "+12%" },
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { series, pie, bars } = data;

  return (
    <AppLayout title="Inteligência de Negócio">
      <Box
        sx={{
          bgcolor: "#F8FAFC",
          minHeight: "100vh",
          p: { xs: 2, md: 4 },
          m: -3,
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: "center",
              borderRadius: "32px",
              background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.04), 0 10px 20px rgba(99, 102, 241, 0.02)",
              maxWidth: "1200px",
              mx: "auto",
            }}
          >
            <Box
              sx={{
                display: "inline-block",
                px: 3,
                py: 1,
                borderRadius: "12px",
                bgcolor: "#6366F115",
                color: "#6366F1",
                mb: 3,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 900, letterSpacing: "2px" }}
              >
                SISTEMA DE GESTÃO INTEGRADO
              </Typography>
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: "#1E293B",
                mb: 3,
                letterSpacing: "-3px",
                fontSize: { xs: "2.8rem", md: "4.5rem" },
                lineHeight: 1,
              }}
            >
              FREELA.SYS
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "#64748B",
                maxWidth: "800px",
                mx: "auto",
                fontWeight: 500,
                lineHeight: 1.8,
                fontSize: "1.1rem",
              }}
            >
              Acompanhe o crescimento da sua carreira freelancer com
              inteligência de dados, gestão de projetos em tempo real e análise
              de performance operacional.
            </Typography>

            <Box
              sx={{
                width: "60px",
                height: "4px",
                bgcolor: "#6366F1",
                mx: "auto",
                mt: 4,
                borderRadius: "2px",
              }}
            />
          </Paper>
        </Container>

        <Box sx={{ width: "100%", px: { md: 2 } }}>
          <Grid container spacing={3} sx={{ mb: 6, justifyContent: "center" }}>
            {[
              {
                label: "Volume Total em Carteira",
                val: "R$ 1.545.500",
                color: "#6366F1",
              },
              { label: "Projetos Ativos", val: "13", color: "#F59E0B" },
              { label: "Ticket Médio", val: "R$ 118.884", color: "#10B981" },
              { label: "Crescimento", val: "+12%", color: "#6366F1" },
            ].map((kpi, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    border: "1px solid #E2E8F0",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: "#64748B",
                      textTransform: "uppercase",
                    }}
                  >
                    {kpi.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 900, color: kpi.color, mt: 1 }}
                  >
                    {kpi.val}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Container maxWidth={false} sx={{ px: { xs: 2, md: 8 }, pb: 10 }}>
            <Grid
              container
              spacing={4}
              justifyContent="center"
              alignItems="stretch"
            >
              <Grid item xs={12} lg={7}>
                <Paper sx={{ ...CARD_SX, p: 4, height: "100%" }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 900, mb: 4, color: "#1E293B" }}
                  >
                    Análise Histórica de Crescimento
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series}>
                        <defs>
                          <linearGradient
                            id="colorArea"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366F1"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366F1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#F1F5F9"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="clientes"
                          stroke="#6366F1"
                          strokeWidth={5}
                          fill="url(#colorArea)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Paper sx={{ ...CARD_SX, p: 4, height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                    Saúde Operacional
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 4, display: "block" }}
                  >
                    Distribuição por status operacional
                  </Typography>
                  <Box
                    sx={{
                      height: 350,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pie}
                          innerRadius={90}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {pie.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ ...CARD_SX, p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>
                    Canais de Aquisição
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bars}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#F1F5F9"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip cursor={{ fill: "#F8FAFC" }} />
                        <Bar
                          dataKey="qty"
                          fill="#6366F1"
                          radius={[10, 10, 0, 0]}
                          barSize={80}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </AppLayout>
  );
}

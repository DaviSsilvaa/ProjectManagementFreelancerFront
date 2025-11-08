/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import AppLayout from "../layout/AppLayout";
import { Grid, Paper, Typography, Box } from "@mui/material";
import {
  LineChart,
  Line,
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
import api from "../services/api";

// Cores padrão do Recharts (sem setar manualmente dark mode, segue lib)
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#00C49F", "#FF8042"];

// no topo do DashboardCharts.jsx
const CARD_W = 420; // largura fixa dos cards (em px)
const CARD_H = 320; // altura dos gráficos

const CARD_SX = {
  p: 2.5,
  borderRadius: 3,
  bgcolor: "rgba(255,255,255,0.95)", // fundo branco “mais cheio”
  boxShadow: "0 12px 28px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)", // sombra mais forte
  border: "1.5px solid rgba(99,102,241,0.12)", // leve borda com tom
  "& .recharts-wrapper": { overflow: "visible" },
};

export default function DashboardCharts() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalClients: 0, projectsOpen: 0 });
  const [series, setSeries] = useState([]);
  const [pie, setPie] = useState([]);
  const [bars, setBars] = useState([]);

  useEffect(() => {
    // Exemplo simples: usa clients como base
    const load = async () => {
      try {
        const res = await api.get("/clients"); // usa tua API real
        const clients = res.data || [];
        // KPIs
        setKpis({
          totalClients: clients.length,
          projectsOpen: Math.floor(clients.length * 0.6), // placeholder
        });
        // Séries: clientes por mês (fake a partir de createdAt se tiver)
        const months = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ];
        const byMonth = months.map((m, i) => ({
          name: m,
          clientes: Math.floor(Math.random() * 8) + (i < 3 ? 2 : 0),
        }));
        setSeries(byMonth);
        // Pie: status fictício
        setPie([
          {
            name: "Ativos",
            value: Math.max(1, Math.floor(clients.length * 0.7)),
          },
          {
            name: "Inativos",
            value: Math.max(
              0,
              clients.length - Math.floor(clients.length * 0.7)
            ),
          },
        ]);
        // Bars: origem fictícia
        setBars([
          { name: "Indicação", qty: Math.floor(Math.random() * 10) + 2 },
          { name: "Instagram", qty: Math.floor(Math.random() * 10) + 2 },
          { name: "Site", qty: Math.floor(Math.random() * 10) + 2 },
          { name: "Outros", qty: Math.floor(Math.random() * 10) + 2 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
<AppLayout title="Dashboard">
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 2,
      justifyContent: "flex-start",
      alignItems: "flex-start",
      p: 2,
    }}
  >
    {/* LINHA */}
    <Paper sx={CARD_SX}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Evolução de Clientes (Últimos 12 meses)
      </Typography>
      <Box sx={{ height: CARD_H }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 24, right: 20, bottom: 8, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} domain={[0, "dataMax + 2"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="clientes"
              stroke="#6366F1"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>

    {/* PIZZA */}
    <Paper sx={{ ...CARD_SX, width: CARD_W * 1}}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Status de Clientes
      </Typography>
      <Box sx={{ height: CARD_H }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={pie}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              startAngle={90}
              endAngle={-270}
            >
              {pie.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>

    <Paper sx={{ ...CARD_SX, width: CARD_W * 2 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Origem dos Clientes
      </Typography>
      <Box sx={{ height: CARD_H }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} margin={{ top: 16, right: 20, bottom: 12, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} />
            <YAxis allowDecimals={false} domain={[0, "dataMax + 2"]} />
            <Tooltip />
            <Bar dataKey="qty" barSize={34} fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  </Box>
</AppLayout>

  );
}

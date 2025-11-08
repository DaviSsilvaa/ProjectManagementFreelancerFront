import React from 'react';
import AppLayout from '../layout/AppLayout';
import { Box, Paper, Typography } from '@mui/material';

export default function Projects() {
  return (
    <AppLayout title="Projetos">
      <Box>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Typography>Em breve: lista e gráficos de projetos.</Typography>
        </Paper>
      </Box>
    </AppLayout>
  );
}

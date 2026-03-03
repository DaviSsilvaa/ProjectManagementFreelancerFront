import React, { useState } from 'react'; 
import { Tabs, Tab, Box, Typography } from '@mui/material';
import AppLayout from '../layout/AppLayout'; 
import ProfilePage from './ProfilePage';

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0); 

  return (
    <AppLayout title="Configurações do Sistema">
      <Box sx={{ width: '100%', mt: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, val) => setTabValue(val)} 
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
        >
          <Tab label="Meu Perfil" sx={{ fontWeight: 700 }} />
          <Tab label="Segurança" sx={{ fontWeight: 700 }} />
        </Tabs>

        {tabValue === 0 && <ProfilePage />}
        
        {tabValue === 1 && (
          <Typography color="text.secondary">Configurações de senha e 2FA (Em breve).</Typography>
        )}
      </Box>
    </AppLayout>
  );
}
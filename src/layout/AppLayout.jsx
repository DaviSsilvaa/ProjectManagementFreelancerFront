import * as React from 'react';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InsightsIcon from '@mui/icons-material/Insights';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260; // Aumentei levemente para dar mais respiro

export default function AppLayout({ children, title = 'Dashboard' }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menu = [
    { text: 'Dashboard', icon: <InsightsIcon />, path: '/dashboard' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/dashboard/clients' },
    { text: 'Projetos', icon: <WorkIcon />, path: '/dashboard/projects' },
  ];

  const drawer = (
    <Box sx={{ bgcolor: '#FFF', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ fontWeight: 800, color: '#4F46E5', letterSpacing: '-0.5px' }}
        >
          FREELA.SYS
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: '#F1F5F9' }} />
      <List sx={{ px: 2, mt: 2 }}>
        {menu.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  '&.Mui-selected': {
                    bgcolor: '#EEF2FF',
                    color: '#4F46E5',
                    '& .MuiListItemIcon-root': { color: '#4F46E5' },
                    '&:hover': { bgcolor: '#E0E7FF' }
                  },
                  '&:hover': { borderRadius: '12px' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: selected ? '#4F46E5' : '#94A3B8' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: selected ? 700 : 500 }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F8FAFC' }}>
      <CssBaseline />
      
      {/* APPBAR REFORMULADA */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(255, 255, 255, 0.8)', // Efeito transparente
          backdropFilter: 'blur(8px)', // Desfoque de fundo (Glassmorphism)
          borderBottom: '1px solid #E2E8F0',
          color: '#1E293B',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#64748B' }}>
              {title}
            </Typography>
          </Box>
          
          {/* Espaço para Avatar de Usuário ou Botão de Sair que você já tem */}
        </Toolbar>
      </AppBar>

      {/* NAVEGAÇÃO LATERIAL */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid #E2E8F0',
              boxShadow: '10px 0 15px -3px rgba(0,0,0,0.05)'
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid #E2E8F0',
              bgcolor: '#FFF'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* ÁREA DE CONTEÚDO */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#F8FAFC', // Cinza azulado muito claro
        }}
      >
        <Toolbar /> {/* Espaçador para não ficar atrás da AppBar */}
        {children}
      </Box>
    </Box>
  );
}
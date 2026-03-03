import * as React from 'react';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Avatar, Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InsightsIcon from '@mui/icons-material/Insights';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import LogoutIcon from '@mui/icons-material/Logout';
import ViewWeekIcon from '@mui/icons-material/ViewWeek'; 
import { useNavigate, useLocation } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

export default function AppLayout({ children, title = 'Dashboard' }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menu = [
    { text: 'Dashboard', icon: <InsightsIcon />, path: '/dashboard' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/dashboard/clients' },
    { text: 'Projetos', icon: <WorkIcon />, path: '/dashboard/projects' },
    { text: 'Kanban', icon: <ViewWeekIcon />, path: '/kanban' },
  ];

  const settingsMenu = [
  { text: 'Configurações', icon: <SettingsIcon />, path: '/settings' }, // Rota pai
];

  const drawer = (
  <Box sx={{ bgcolor: '#FFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Toolbar sx={{ display: 'flex', justifyContent: 'flex-start', py: 3, px: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ bgcolor: '#4F46E5', p: 0.8, borderRadius: '10px', display: 'flex' }}>
          <InsightsIcon sx={{ color: '#FFF', fontSize: 20 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E293B', letterSpacing: '-1px' }}>
          FREELA.SYS
        </Typography>
      </Box>
    </Toolbar>

    

    {/* CARD DO USUÁRIO LOGADO */}
<Box sx={{ px: 2, mb: 3 }}>
  <Box sx={{ 
    p: 2, 
    bgcolor: '#F8FAFC', 
    borderRadius: '16px', 
    border: '1px solid #F1F5F9',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    transition: '0.3s',
    '&:hover': { bgcolor: '#F1F5F9' }
  }}>
    <Avatar 
      sx={{ 
        width: 45, 
        height: 45, 
        bgcolor: '#4F46E5', 
        fontWeight: 800,
        boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
      }}
    >
      {user?.name?.charAt(0).toUpperCase() || 'D'}
    </Avatar>
    <Box sx={{ overflow: 'hidden' }}>
      <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E293B' }} noWrap>
        {user?.name}
      </Typography>
    </Box>
  </Box>
</Box>



    <Divider sx={{ mx: 2, borderColor: '#F1F5F9' }} />
    
    <Box sx={{ px: 2, mt: 3, flexGrow: 1 }}>
      <Typography variant="caption" sx={{ px: 2, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Menu Principal
      </Typography>
      
      <List sx={{ mt: 1 }}>
        {menu.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  py: 1.2,
                  '&.Mui-selected': {
                    bgcolor: '#4F46E5',
                    color: '#FFF',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                    '& .MuiListItemIcon-root': { color: '#FFF' },
                    '&:hover': { bgcolor: '#4338CA' }
                  },
                  '&:hover': { bgcolor: '#F8FAFC' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: selected ? '#FFF' : '#94A3B8' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: selected ? 700 : 600 }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>

    <Box sx={{ px: 2, mt: 3 }}>
  
  <List sx={{ mt: 1 }}>
    {settingsMenu.map((item) => {
      const selected = location.pathname === item.path;
      return (
        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={selected}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: '12px',
              '&.Mui-selected': {
                bgcolor: '#F1F5F9', // Cor diferente para destacar que é configuração
                color: '#1E293B',
                '& .MuiListItemIcon-root': { color: '#4F46E5' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: selected ? '#4F46E5' : '#94A3B8' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} 
            />
          </ListItemButton>
        </ListItem>
      );
    })}
  </List>
</Box>

    <Box sx={{ p: 2, mt: 'auto' }}>
      <ListItemButton
        onClick={logout}
        sx={{
          borderRadius: '12px',
          color: '#64748B',
          '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444', '& .MuiListItemIcon-root': { color: '#EF4444' } }
        }}
      >
        <ListItemIcon sx={{ minWidth: 38, color: '#94A3B8' }}>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText 
          primary="Finalizar Sessão" 
          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 700 }} 
        />
      </ListItemButton>
    </Box>
  </Box>
);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F8FAFC' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
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
          
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', display: { xs: 'none', sm: 'block' } }}>
              {user?.name}
            </Typography>
            <Avatar 
              sx={{ 
                width: 35, 
                height: 35, 
                bgcolor: '#4F46E5', 
                fontSize: '0.9rem', 
                fontWeight: 700 
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'D'}
            </Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
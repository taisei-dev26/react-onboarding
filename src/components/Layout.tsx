import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'ユーザー一覧', icon: <PeopleIcon />, path: '/' },
  { text: 'ユーザー登録', icon: <PersonAddIcon />, path: '/users/new' },
];

type LayoutProps = {
  children?: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    history.push(path);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* ヘッダー部分: 画面上部に固定 */}

      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="メニューを開く"
            sx={{ mr: 2, color: '#000' }}
          ><MenuIcon /></IconButton>
          <Typography variant="h6" noWrap sx={{ color: '#000' }}>
            ユーザー管理システム
          </Typography>
        </Toolbar>
      </AppBar>

      {/* サイドナビゲーション */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* メインコンテンツ表示エリア */}
      <Box component="main" sx={{ flexGrow: 1, p: 3}}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';
import { useUser } from '../src/context/UserContext';
import { useLogout } from '../src/context/UserLogout';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    maxWidth: '70vw',
  },
}));

function SideMenuMobile({ open, toggleDrawer, selectedPage, setSelectedPage }) {
  const { user } = useUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      toggleDrawer(false);
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Función para manejar selección en el menú (igual que en SideMenu web)
  const handleMenuSelect = (pageText) => {
    toggleDrawer(false)();
    setSelectedPage(pageText);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => toggleDrawer(false)()}
      variant="temporary"
      ModalProps={{
        keepMounted: true, // mejora rendimiento en móviles
      }}
      PaperProps={{
        sx: { maxWidth: '70vw' },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}>
            <Avatar
              sizes="small"
              alt={user?.username || 'Usuario'}
              src="/static/images/avatar/7.jpg"
              sx={{ width: 24, height: 24 }}
            />
            <Typography component="p" variant="h6">
              {user?.username || 'Usuario'}
            </Typography>
          </Stack>
          <OptionsMenu />
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
          />
        </Stack>
        <Divider />
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Cerrando...' : 'Logout'}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  selectedPage: PropTypes.string.isRequired,
  setSelectedPage: PropTypes.func.isRequired,
};

export default SideMenuMobile;

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';


const mainListItems = [
  { text: 'Inicio', icon: <HomeRoundedIcon />, path: '/dashboard' },
  { text: 'Formularío Venta', icon: <ReceiptLongIcon />, path: '/formulario-venta' },
  { text: 'Estadísticas', icon: <AnalyticsRoundedIcon />, path: '/estadisticas' },
  { text: 'Registro de Usuario', icon: <PersonAddIcon />, path: '/registro-usuario' },
  { text: 'Registro de Empacadores', icon: <PersonAddIcon />, path: '/registro-empacadores' },
  { text: 'Alertas', icon: <NotificationsActiveRoundedIcon />, path: '/alertas' },
];

export default function MenuContent({ selectedPage, setSelectedPage, onSelect }) {
  const handleClick = (text) => {
    if (onSelect) {
      onSelect(text);
    } else if (setSelectedPage) {
      setSelectedPage(text);
    }
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={item.text === selectedPage}
              onClick={() => handleClick(item.text)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

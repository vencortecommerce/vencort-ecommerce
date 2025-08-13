import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../components/AppNavbar';
import MainGrid from '../components/MainGrid';
import MainGridEstadistics from '../components/MainGridEstadistics'; 
import MainGridUserRegister from '../components/MainGridUserRegister'; 
import MainGridPackerRegister from '../components/MainGridPackerRegister'; 
import MainGridSale from '../components/MainGridSale'; 
import MainGridSaleDetail from '../components/MainGridSaleDetail'; 

import SideMenu from '../components/SideMenu';
import AppTheme from '../theme/AppTheme';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const [selectedPage, setSelectedPage] = React.useState('Inicio'); 

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
        <AppNavbar selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            {selectedPage === 'Inicio' && <MainGrid />}
            {selectedPage === 'Formularío Venta' && <MainGridSale/>}
            {selectedPage === 'Estadísticas' && <MainGridEstadistics />}
            {selectedPage === 'Registro de Usuario' && <MainGridUserRegister/>}
            {selectedPage === 'Registro de Empacadores' && <MainGridPackerRegister/>}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}

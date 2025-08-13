import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import CustomizedDataGrid from './CustomizedDataGrid';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';

{/**INICIO ESTADISTICAS*/}

export default function MainGridEstadistics() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, mx: 'auto' }}>
      {/* Título */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>

      {/* Gráficos */}
      <Grid
        container
        spacing={2}
        sx={{ mb: 2 }}
      >
        {/* Gráfico de sesiones (ocupa 100% en móvil, 12 columnas en desktop) */}
        <Grid item xs={12} md={12}>
          <SessionsChart />
        </Grid>

        {/* Puedes agregar más tarjetas o gráficos aquí si deseas */}
        {/* <Grid item xs={12} md={6}>...</Grid> */}
      </Grid>
    </Box>
  );
}

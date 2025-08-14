import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SessionsChart from './SessionsChart';
import ChartSalesByStatus from './ChartSalesByStatus';
import Productos from './Productos';

export default function MainGridEstadistics() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, mx: 'auto' }}>
      {/* Título */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Estadísticas
      </Typography>

      {/* Layout de gráficos */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <SessionsChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartSalesByStatus />
        </Grid>

        <Grid item xs={12}>
          <Productos/>
        </Grid>
      </Grid>
    </Box>
  );
}

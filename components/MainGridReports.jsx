import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import FileProductos from './FileProductos';

export default function MainGridReports() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, mx: 'auto' }}>
      {/* Título */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Reportes
      </Typography>

      {/* Layout de reportes */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <FileProductos />
        </Grid>
      </Grid>
    </Box>
  );
}

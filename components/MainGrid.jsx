import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomizedDataGrid from './CustomizedDataGrid';
import SaleActions from './SaleActions';

export default function MainGrid() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', md: '1700px' },
        mx: 'auto', // centrar horizontalmente
        px: 2, // padding horizontal para evitar que se pegue a los bordes
      }}
    >
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Detalle
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={9}>
          <Box
            sx={{
              width: '95%',
              overflowX: 'auto',
            }}
          >
            <SaleActions />
        
            <CustomizedDataGrid />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
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
        height: '100%',
        maxWidth: { xs: '100%', md: '1700px' }
      }}
    >
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Ventas
      </Typography>

      <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
        <Grid item xs={12} lg={9} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ mb: 2 }}>
            <SaleActions />
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              height: '100%',
              overflow: 'auto',
            }}
          >
            <CustomizedDataGrid />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

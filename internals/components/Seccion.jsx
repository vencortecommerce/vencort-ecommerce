import * as React from 'react';
import { Paper, Typography, Grid } from '@mui/material';

export default function Seccion({ titulo, contenido }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {titulo}
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(contenido).map(([key, value], idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Typography>
              <strong>{formatearEtiqueta(key)}:</strong> {value || '—'}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

const formatearEtiqueta = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ');

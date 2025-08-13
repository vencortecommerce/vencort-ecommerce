import * as React from 'react';
import {
  TextField, Grid, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Button, Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import clienteAxios from '../src/context/Config';
import { Box } from '@mui/material';

export default function MainGridPackerRegister() {
  const [packers, setPackers] = React.useState([]);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [loadingTable, setLoadingTable] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    empacador_nombre: '',
    empacador_correo: '',
    empacador_activo: 'true',
  });

  React.useEffect(() => {
    const fetchPackers = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await clienteAxios.get('/api/empacador/consulta', config);
        const mapped = response.data.map((p) => ({
          id: p.id_empacador,
          empacador_nombre: p.empacador_nombre,
          empacador_correo: p.empacador_correo,
          empacador_activo: p.empacador_activo ? 'Sí' : 'No',
        }));
        setPackers(mapped);
      } catch (error) {
        console.error('Error al cargar empacadores:', error);
        setError('Error al cargar empacadores.');
      } finally {
        setLoadingTable(false);
      }
    };

    fetchPackers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const payload = {
        empacador_nombre: formData.empacador_nombre,
        empacador_correo: formData.empacador_correo,
        empacador_activo: formData.empacador_activo === 'true',
      };

      await clienteAxios.post('/api/empacador/registro', payload, config);

      const newPacker = {
        id: packers.length + 1,
        empacador_nombre: payload.empacador_nombre,
        empacador_correo: payload.empacador_correo,
        empacador_activo: payload.empacador_activo ? 'Sí' : 'No',
      };

      setPackers((prev) => [...prev, newPacker]);
      setSuccessMessage('Empacador registrado exitosamente');
      setFormData({ empacador_nombre: '', empacador_correo: '', empacador_activo: 'true' });
    } catch (err) {
      const responseError = err?.response?.data?.error || 'Error al registrar empacador.';
      setError(responseError);
      console.error('Error al registrar empacador:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessMessage = () => setSuccessMessage('');

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 70, flex: 0.5 },
    { field: 'empacador_nombre', headerName: 'Nombre', minWidth: 200, flex: 1 },
    { field: 'empacador_correo', headerName: 'Correo', minWidth: 250, flex: 1 },
    { field: 'empacador_activo', headerName: 'Activo', minWidth: 100, flex: 0.5 },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h6" gutterBottom>Registrar nuevo empacador</Typography>
  
      <Box mb={4}> {/* 👈 Espaciado agregado aquí */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Nombre"
                name="empacador_nombre"
                value={formData.empacador_nombre}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Correo"
                name="empacador_correo"
                type="email"
                value={formData.empacador_correo}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth required>
                <InputLabel id="activo-label">¿Activo?</InputLabel>
                <Select
                  labelId="activo-label"
                  id="activo-select"
                  name="empacador_activo"
                  value={formData.empacador_activo}
                  onChange={handleChange}
                  label="¿Activo?"
                >
                  <MenuItem value="true">Sí</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
                disabled={submitting}
              >
                {submitting ? 'Registrando...' : 'Registrar'}
              </Button>
            </Grid>
          </Grid>
          {error && (
            <Grid item xs={12} style={{ marginTop: 10 }}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </form>
      </Box>
  
      {/* Tabla con separación abajo del formulario */}
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={packers}
          columns={columns}
          loading={loadingTable}
          pageSizeOptions={[5, 10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          disableRowSelectionOnClick
          density="compact"
        />
      </div>
    </div>
  );
  
}

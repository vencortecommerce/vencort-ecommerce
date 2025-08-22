import * as React from 'react';
import {
  TextField, Grid, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Button, Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import clienteAxios from '../src/context/Config';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function MainGridAlerts() {
  const [alerts, setAlerts] = React.useState([]);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [loadingTable, setLoadingTable] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    alerta: '',
    detalleAlerta: '',
    valor: 0,
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await clienteAxios.get('/api/alertas/consulta', config);
        const mapped = response.data.map((a, idx) => ({
          id: a.id_alerta,
          alerta: a.alerta,
          detalleAlerta: a.detalleAlerta,
          valor: a.valor,
          usuario: a.usuario,
          registro: a.registro,
        }));
        setAlerts(mapped);
      } catch (error) {
        if (error?.response?.status === 401) {
          navigate('/');
        }else{
          console.error('Error al cargar alertas:', error);
          setError('Error al cargar alertas.');
        }
      } finally {
        setLoadingTable(false);
      }
    };

    fetchAlerts();
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
        alerta: formData.alerta,
        detalleAlerta: formData.detalleAlerta,
        valor: Number(formData.valor),
      };

      await clienteAxios.post('/api/alertas/registro', payload, config);

      setSuccessMessage('Alerta registrada exitosamente');
      setFormData({ alerta: '', detalleAlerta: '', valor: 0 });

      const response = await clienteAxios.get('/api/alertas/consulta', config);
      const mapped = response.data.map((a) => ({
        id: a.id_alerta,
        alerta: a.alerta,
        detalleAlerta: a.detalleAlerta,
        valor: a.valor,
        usuario: a.usuario,
        registro: a.registro,
      }));
      setAlerts(mapped);
    } catch (err) {
      const responseError = err?.response?.data?.error || 'Error al registrar alerta.';
      setError(responseError);
      console.error('Error al registrar alerta:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessMessage = () => setSuccessMessage('');

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 70, flex: 0.5 },
    { field: 'alerta', headerName: 'Alerta', minWidth: 200, flex: 1 },
    { field: 'detalleAlerta', headerName: 'Detalle', minWidth: 250, flex: 1 },
    { field: 'valor', headerName: 'Valor', minWidth: 100, flex: 0.5 },
    { field: 'usuario', headerName: 'Usuario', minWidth: 150, flex: 0.5 },
    { field: 'registro', headerName: 'Registro', minWidth: 150, flex: 0.5 },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h6" gutterBottom>Registrar Nueva Alerta</Typography>

      <Box mb={4}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required size="large">
                <InputLabel id="alerta-label">Tipo de Alerta</InputLabel>
                <Select
                  labelId="alerta-label"
                  id="alerta-select"
                  name="alerta"
                  value={formData.alerta}
                  onChange={handleChange}
                  label="Tipo de Alerta"
                >
                  <MenuItem value="EMPACADO_PEDIDO">SLA DE EMPACADO DE PEDIDO FORMATO HORA</MenuItem>
                  <MenuItem value="EMBARQUE">HORA DE EMBARQUE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                label="Detalle"
                name="detalleAlerta"
                value={formData.detalleAlerta}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                required
                label="Valor"
                name="valor"
                type="number"
                value={formData.valor}
                onChange={handleChange}
                fullWidth
              />
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

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={alerts}
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

import * as React from 'react';
import {
  TextField, Grid, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, useTheme
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import clienteAxios from '../src/context/Config';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export default function MainGridPackerRegister() {
  const [packers, setPackers] = React.useState([]);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [loadingTable, setLoadingTable] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingPacker, setEditingPacker] = React.useState(null);
  const navigate = useNavigate();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = React.useState({
    empacador_nombre: '',
    empacador_correo: '',
    empacador_activo: 'true',
  });

  React.useEffect(() => {
    fetchPackers();
  }, []);

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
        id_empacador: p.id_empacador,
      }));
      setPackers(mapped);
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate('/');
      } else {
        console.error('Error al cargar empacadores:', error);
      }
    } finally {
      setLoadingTable(false);
    }
  };

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
      setSuccessMessage('Empacador registrado exitosamente');
      setFormData({ empacador_nombre: '', empacador_correo: '', empacador_activo: 'true' });
      fetchPackers();
    } catch (err) {
      const responseError = err?.response?.data?.error || 'Error al registrar empacador.';
      setError(responseError);
      console.error('Error al registrar empacador:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (row) => {
    setEditingPacker(row);
    setFormData({
      empacador_nombre: row.empacador_nombre,
      empacador_correo: row.empacador_correo,
      empacador_activo: row.empacador_activo === 'Sí' ? 'true' : 'false',
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingPacker) return;
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
        id_empacador: editingPacker.id_empacador,
        empacador_nombre: formData.empacador_nombre,
        empacador_correo: formData.empacador_correo,
        empacador_activo: formData.empacador_activo === 'true',
      };
      await clienteAxios.post('/api/empacador/actualiza', payload, config);
      setSuccessMessage('Empacador actualizado exitosamente');
      setEditModalOpen(false);
      fetchPackers();
    } catch (err) {
      const responseError = err?.response?.data?.error || 'Error al actualizar empacador.';
      setError(responseError);
      console.error('Error al actualizar empacador:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { field: 'empacador_nombre', headerName: 'Nombre', minWidth: 200, flex: 1 },
    { field: 'empacador_correo', headerName: 'Correo', minWidth: 250, flex: 1 },
    { field: 'empacador_activo', headerName: 'Activo', minWidth: 100, flex: 0.5 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      minWidth: 100,
      flex: 0.4,
      sortable: false,
      renderCell: (params) => (
        <Button
          onClick={() => handleEditClick(params.row)}
          color="primary"
          size="small"
          sx={{ minWidth: 0, padding: 1 }}
        >
          <EditOutlinedIcon fontSize="small" />
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h6" gutterBottom>Registrar Nuevo Empacador</Typography>

      <Box mb={4}>
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
        </form>
      </Box>

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

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="sm" fullScreen={fullScreen}>
        <DialogTitle>{fullScreen ? 'Editar Empacador' : 'Editar Información de Empacador'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                name="empacador_nombre"
                value={formData.empacador_nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Correo"
                name="empacador_correo"
                value={formData.empacador_correo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>¿Activo?</InputLabel>
                <Select
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
      {error && (
        <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError('')}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
    </div>
  );
}

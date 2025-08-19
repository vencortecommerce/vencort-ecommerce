import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Button, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Alert, Snackbar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import clienteAxios from '../src/context/Config';
import { useNavigate } from 'react-router-dom';

export default function MainGridUserRegister() {
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState([]);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true); // Cambio: inicia como true
  const [formData, setFormData] = React.useState({
    name: '', lastName: '', username: '', email: '', description: '', role: '',
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await clienteAxios.get('/api/usuarios/consultaUsuarios', config);
        const mappedUsers = response.data.map((user, index) => ({
          id: index + 1,
          name: user.name,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          description: user.description,
          role: user.perfiles?.[0]?.rol || 'N/A',
        }));
        setUsers(mappedUsers);
      } catch (error) {
        if (error?.response?.status === 401) {
          navigate('/');
        }else{
          console.error('Error al cargar usuarios:', error);
          setError('Error al cargar usuarios.');
        }
      } finally {
        setLoading(false); // Se oculta el loader solo después de obtener datos
      }
    };

    fetchUsers();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setFormData({ name: '', lastName: '', username: '', email: '', description: '', role: '' });
    setError('');
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const payload = {
        ...formData,
        role: formData.role ? [formData.role] : ['ROLE_USER'],
      };

      await clienteAxios.post('/api/usuarios/registro', payload, config);

      const newUser = {
        id: users.length + 1,
        ...formData,
        role: formData.role ? [formData.role] : ['ROLE_USER'],
      };

      setUsers((prev) => [...prev, newUser]);
      setSuccessMessage('Usuario registrado exitosamente');
      handleClose();
    } catch (err) {
      const responseError = err?.response?.data?.error || 'Error al registrar usuario.';
      setError(responseError);
      console.error('Error al registrar usuario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessMessage = () => setSuccessMessage('');

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', width: 130 },
    { field: 'lastName', headerName: 'Apellido', width: 130 },
    { field: 'username', headerName: 'Usuario', width: 130 },
    { field: 'email', headerName: 'Correo', width: 200 },
    { field: 'description', headerName: 'Descripción', width: 200 },
    { field: 'role', headerName: 'Rol', width: 120 },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        Registrar Usuario
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Registrar nuevo usuario</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <DialogContentText>
              Llena los datos del nuevo usuario a registrar.
            </DialogContentText>
            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField required label="Nombre" name="name" value={formData.name} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required label="Apellido" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required label="Usuario" name="username" value={formData.username} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required type="email" label="Correo" name="email" value={formData.email} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Descripción" name="description" value={formData.description} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="role-label">Rol</InputLabel>
                  <Select labelId="role-label" name="role" value={formData.role} onChange={handleChange} label="Rol">
                    <MenuItem value="ROLE_ADMIN">ADMIN</MenuItem>
                    <MenuItem value="ROLE_USER">USUARIO</MenuItem>
                    <MenuItem value="ROLE_SURTIDOR">SURTIDOR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ pb: 2, px: 3 }}>
            <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button variant="contained" color="success" type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccessMessage} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <div style={{ marginTop: 30, height: 400, width: '100%', overflowX: 'auto' }}>
      <div style={{ minWidth: 900 }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          disableRowSelectionOnClick
          density="compact"
        />
      </div></div>
    </div>
  );
}

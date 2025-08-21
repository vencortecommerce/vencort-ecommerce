import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import clienteAxios from './context/Config';

const defaultTheme = createTheme();

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SignIn() {
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const password = data.get('password');
  
    setUsernameError(false);
    setPasswordError(false);
  
    if (!username) {
      setUsernameError(true);
      setUsernameErrorMessage('Por favor, introduce una dirección de correo electrónico válida.');
      setLoading(false);
      return;
    }
  
    if (!password) {
      setPasswordError(true);
      setPasswordErrorMessage('La contraseña es obligatoria.');
      setLoading(false);
      return;
    }
  
    try {
      // Aquí usamos clienteAxios en lugar de fetch
      const response = await clienteAxios.post('/api/usuarios/autenticacion', { username, password });

      const result = response.data;

      const { token, username: usernameResult, email } = result;

      if (!setUser) {
        console.error('setUser no está definido');
      } else {
        setUser({ username: usernameResult, email, token });
      }

      localStorage.removeItem('token');
      localStorage.setItem('authToken', token);
      
      localStorage.setItem('user', JSON.stringify(result));
      setSnackbarMessage('Sesión iniciada correctamente');
      setSnackbarSeverity('success');
      setOpen(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (error) {
      console.error('Error en catch:', error);
      // Mejor manejo para mostrar mensaje según el error
      if (error.response && error.response.data && error.response.data.message) {
        setSnackbarMessage(error.response.data.message);
      } else {
        setSnackbarMessage('No se pudo conectar con el servidor');
      }
      setSnackbarSeverity('error');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Container
          component="main"
          maxWidth="xs"
          sx={{
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Iniciar sesión
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Correo electrónico"
                name="username"
                autoComplete="email"
                type="email"
                autoFocus
                error={usernameError}
                helperText={usernameErrorMessage}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                error={passwordError}
                helperText={passwordErrorMessage}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    color="primary"
                    onChange={() => setRemember(!remember)}
                  />
                }
                label="Recordarme"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? 'Cargando...' : 'Ingresar'}
              </Button>
            </Box>
          </Box>
        </Container>
        <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
          <Alert onClose={() => setOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

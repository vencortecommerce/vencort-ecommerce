import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Snackbar,
  Alert, CardContent, Card, Chip
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';
import clienteAxios from '../src/context/Config';
import { useNavigate } from 'react-router-dom';

export default function SaleActions() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const navigate = useNavigate();
  const handleDownloadTemplate = async () => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    try {
      const response = await clienteAxios.get('/api/ventas/plantilla', {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla-ventas.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate('/');
      }else{
        console.error('Error descargando la plantilla:', error);
        alert('No se pudo descargar la plantilla. Intenta más tarde.');
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      setError(false);
    } else {
      alert('Por favor selecciona un archivo .xlsx válido');
      setSelectedFile(null);
      setError(true);
      event.target.value = null;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(true);
      alert('Debes seleccionar un archivo antes de cargar.');
      return;
    }

    setError(false);
    setLoading(true);

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      await clienteAxios.post('/api/ventas/registro', formData, config);
      setSnackbar({
        open: true,
        message: `Archivo "${selectedFile.name}" cargado correctamente.`,
        severity: 'success',
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al cargar el archivo. ${error?.response?.data?.error || 'Error desconocido'}`,
        severity: 'error',
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  const [subtotales, setSubtotales] = React.useState([]);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [inventario, setInventario] = React.useState([]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
  
      const response = await clienteAxios.post(
        `/api/reportes/subTotales`,
        {},
        config
      );
  
      const arr = Array.isArray(response.data) ? response.data : [];
      const estadosValidos = ['POR SURTIR','CANCELADO','DEMORADO','TARDÍO','EMPACADO','SURTIDO','EMBARCADO'];
  
      const completados = estadosValidos.map((estado) => {
        const existente = arr.find(item => item.estado === estado);
        return existente ?? { estado, total: 0, porcentaje: 0, origen: '' };
      });
  
      setSubtotales(completados);


      const estadosValidosInventario = ['BAJO STOCK','SIN EXISTENCIA'];

      const inventario = estadosValidosInventario.map((estado) => {
        const existente = arr.find(item => item.estado === estado);
        return existente ?? { estado, total: 0, porcentaje: 0, origen: '' };
      });
      setInventario(inventario);


    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setErrorMsg('No se pudieron cargar los datos del reporte. Intenta de nuevo.');
      setSubtotales([]);
      setInventario([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box sx={{ width: '100%' }}>
     
     <Stack direction="row" spacing={2}>
      {subtotales.map((item) => (
        <Card key={item.estado} sx={{ minWidth: 180 }}>
          <CardContent>
            <Typography component="h2" variant="subtitle2" gutterBottom>
              {item.estado}
            </Typography>
            <Stack sx={{ justifyContent: 'space-between' }}>
              <Stack
                direction="row"
                sx={{
                  alignContent: { xs: 'center', sm: 'flex-start' },
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="h4" component="p">
                  {item.total}
                </Typography>
                <Chip
                  size="small"
                  color={
                    item.estado === 'CANCELADO'
                      ? 'error'
                      : item.estado === 'DEMORADO'
                      ? 'error'
                      : item.estado === 'TARDÍO'
                      ? 'warning'
                      : item.estado === 'EMPACADO'
                      ? 'info'
                      : item.estado === 'SURTIDO'
                      ? 'info'
                      : item.estado === 'POR SURTIR'
                      ? 'info'
                      : 'warning'
                  }
                  label={`${item.porcentaje}%`}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Inventario
      </Typography>
      <Stack direction="row" spacing={2}>
        {inventario.map((item) => (
          <Chip
            key={item.estado}
            label={`${item.estado}: ${item.total}`}
            sx={{
              fontSize: '14px',
              px: 2,
              py: 1,
              bgcolor:
                item.estado === 'SIN EXISTENCIA' ? '#f44336' : // rojo
                item.estado === 'BAJO STOCK' ? '#ff9800' : // naranja
                'default',
              color: 'white',
            }}
          />
        ))}
      </Stack>
    </Box>
    <br></br> 
    <Stack
        direction="row"
        alignItems="flex-start"
        spacing={2}
        sx={{ mb: 2 }}
      >

                  
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleDownloadTemplate}
        >
          Descargar Plantilla
        </Button>

        <Stack direction="column" spacing={1} alignItems="flex-end">
          <Stack direction="row" spacing={1} alignItems="center">
            <input
              type="file"
              accept=".xlsx"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              color={error ? 'error' : 'primary'}
            >
              Seleccionar archivo
            </Button>
            <Button
              variant="contained"
              color={error ? 'error' : 'secondary'}
              startIcon={<UploadFileIcon />}
              onClick={handleUpload}
              disabled={!selectedFile || loading}
            >
              {loading ? 'Cargando...' : 'Cargar archivo'}
            </Button>
          </Stack>

          {selectedFile ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">
                Archivo seleccionado: <strong>{selectedFile.name}</strong>
              </Typography>
              <IconButton size="small" onClick={handleRemoveFile}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : error && (
            <Typography variant="body2" color="error">
              No se ha seleccionado un archivo válido.
            </Typography>
          )}
        </Stack>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

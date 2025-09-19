import * as React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Button,
  Link,
  CircularProgress,
} from '@mui/material';
import Title from './Title';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import clienteAxios from '../src/context/Config';
import { useNavigate } from 'react-router-dom';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function FileVentasTotales() {
  const [fechaInicial, setFechaInicial] = React.useState(null);
  const [fechaFinal, setFechaFinal] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const navigate = useNavigate();

  const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

  const handleDownloadTemplate = async (fInicial, fFinal) => {

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    setLoading(true);
      try {
        const response = await clienteAxios.get(`/api/archivos/ventasTotales?fechaInicial=${fInicial}&fechaFinal=${fFinal}`, {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ventas.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        if (error?.response?.status === 401) {
          navigate('/');
        }else{
          console.error('Error descargando el reporte:', error);
          alert('No se pudo descargar el reporte. Intenta más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };


  React.useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    setFechaInicial(oneMonthAgo);
    setFechaFinal(today);
  }, []);

  const handleBuscar = () => {
    if (!fechaInicial || !fechaFinal) {
      alert('Selecciona ambas fechas');
      return;
    }
    const fInicial = formatDate(fechaInicial);
    const fFinal = formatDate(fechaFinal);
    handleDownloadTemplate(fInicial, fFinal);
  };

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Title>Consulta Ventas Totales</Title>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <DatePicker
              label="Fecha Inicial"
              value={fechaInicial}
              onChange={(newValue) => setFechaInicial(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="Fecha Final"
              value={fechaFinal}
              onChange={(newValue) => setFechaFinal(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />

          <Button
                fullWidth
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={handleBuscar}
                sx={{
                  alignSelf: 'center',
                  minWidth: 80,
                  whiteSpace: 'nowrap',
                }}
              >
                Descargar
              </Button>

          </Stack>
        </LocalizationProvider>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
          </>
        )}
      </CardContent>
    </Card>
  );
}

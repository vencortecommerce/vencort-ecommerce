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

export default function SLAPacker() {
  const [fechaInicial, setFechaInicial] = React.useState(null);
  const [fechaFinal, setFechaFinal] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const navigate = useNavigate();
  const [loadingFile, setLoadingFile] = React.useState(false);

  const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

  const fetchTotales = async (fInicial, fFinal) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await clienteAxios.post(
        `/api/reportes/slaempacador?fechaInicial=${fInicial}&fechaFinal=${fFinal}`,
        {},
        config
      );

      setRows(response.data);
    } catch (error) {
      if (error?.response?.status === 401 && error?.response?.data?.error === 'Acceso no autorizado') {
          navigate('/');
      }else{
        console.error('Error al consultar los SLA Empacador más vendidos:', error);
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

    fetchTotales(formatDate(oneMonthAgo), formatDate(today));
  }, []);

  const handleBuscar = () => {
    if (!fechaInicial || !fechaFinal) {
      alert('Selecciona ambas fechas');
      return;
    }
    const fInicial = formatDate(fechaInicial);
    const fFinal = formatDate(fechaFinal);
    fetchTotales(fInicial, fFinal);
  };


  const handleDescargar = (idEmpacador) => {
    if (!fechaInicial || !fechaFinal) {
      alert('Selecciona ambas fechas');
      return;
    }
    console.log("ID ",idEmpacador);
    const fInicial = formatDate(fechaInicial);
    const fFinal = formatDate(fechaFinal);
    handleDownloadTemplate(fInicial, fFinal, idEmpacador);
  };

  const handleDownloadTemplate = async (fInicial, fFinal, idEmpacador) => {

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    setLoadingFile(true);
      try {
        const response = await clienteAxios.get(`/api/archivos/ventasEmpacador?fechaInicial=${fInicial}&fechaFinal=${fFinal}&idEmpacador=${idEmpacador}`, {
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
        setLoadingFile(false);
      }
    };  


  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Title>SLA Empacador</Title>

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
            <Button variant="contained" color="primary" onClick={handleBuscar} sx={{ width: '40%' }}>
            {loadingFile ? 'Descargando...' : 'Buscar'}
            </Button>
          </Stack>
        </LocalizationProvider>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Empacador</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Pedidos Atendidos</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Pedidos Cumplimiento SL</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Porcentaje Cumplimiento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Promedio Empaques 1hra</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(rows) && rows.length > 0 ? (
                  rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell><Link  onClick={() => handleDescargar(row.idEmpacador)}>
                        {row.empacador}
                      </Link></TableCell>
                      <TableCell>{row.pedidos}</TableCell>
                      <TableCell>{row.pedidosSLA}</TableCell>
                      <TableCell>{row.porcentaje}</TableCell>
                      <TableCell>{row.promedio}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Box sx={{ mt: 3 }}>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

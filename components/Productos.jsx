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

export default function Productos() {
  const [fechaInicial, setFechaInicial] = React.useState(null);
  const [fechaFinal, setFechaFinal] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]);

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
        `/api/reportes/productos?fechaInicial=${fInicial}&fechaFinal=${fFinal}`,
        {},
        config
      );

      setRows(response.data);
    } catch (error) {
      console.error('Error al consultar los productos más vendidos:', error);
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

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Title>Productos más Vendidos</Title>

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
            <Button variant="contained" color="primary" onClick={handleBuscar}>
              Buscar
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
                  <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Unidades</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Origen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell>{row.unidades}</TableCell>
                    <TableCell>${row.total?.toFixed(2)}</TableCell>
                    <TableCell>{row.origen}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ mt: 3 }}>
              <Link color="primary" href="#" onClick={(e) => e.preventDefault()}>
                Ver más productos
              </Link>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

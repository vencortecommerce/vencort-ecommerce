import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { LineChart } from '@mui/x-charts/LineChart';
import clienteAxios from '../src/context/Config';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default function SessionsChart() {
  const theme = useTheme();
  const [chartLabels, setChartLabels] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);
  const [fechaInicial, setFechaInicial] = React.useState(null);
  const [fechaFinal, setFechaFinal] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

  const fetchData = async (fInicial, fFinal) => {
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
        `/api/ventas/estadisticas?fechaInicial=${fInicial}&fechaFinal=${fFinal}`,
        {},
        config
      );

      const sortedData = [...response.data].sort(
        (a, b) => new Date(a.ventas_fechaventa) - new Date(b.ventas_fechaventa)
      );

      const labels = sortedData.map(item =>
        new Date(item.ventas_fechaventa).toLocaleString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      );

      const values = sortedData.map(item => item.ventas);

      setChartLabels(labels);
      setChartData(values);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial: últimos 30 días
  React.useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setFechaInicial(thirtyDaysAgo);
    setFechaFinal(today);
    fetchData(formatDate(thirtyDaysAgo), formatDate(today));
  }, []);

  const handleBuscar = () => {
    if (!fechaInicial || !fechaFinal) {
      alert('Selecciona ambas fechas');
      return;
    }
    const fInicial = formatDate(fechaInicial);
    const fFinal = formatDate(fechaFinal);
    fetchData(fInicial, fFinal);
  };

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        {/* Calendarios y botón buscar */}
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

        {/* Loader mientras carga */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Título y resumen */}
            <Typography component="h2" variant="subtitle2" gutterBottom>
              Ventas Realizadas
            </Typography>
            <Stack sx={{ justifyContent: 'space-between' }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" component="p">
                  {chartData.reduce((sum, val) => sum + val, 0)}
                </Typography>
                <Chip size="small" color="success" label={`${chartData.length} registros`} />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Por fecha seleccionada
              </Typography>
            </Stack>

            {/* Scroll horizontal si es necesario */}
            <Box sx={{ overflowX: 'auto', mt: 2 }}>
              <LineChart
                colors={colorPalette}
                xAxis={[
                  {
                    scaleType: 'point',
                    data: chartLabels,
                    height: 50,
                    tickLabelStyle: {
                      angle: -45,
                      textAnchor: 'end',
                      fontSize: 12,
                    },
                  },
                ]}
                yAxis={[{ width: 60 }]}
                series={[
                  {
                    id: 'ventas',
                    label: 'Ventas',
                    showMark: true,
                    curve: 'linear',
                    area: true,
                    data: chartData,
                  },
                ]}
                width={Math.max(chartLabels.length * 60, 600)}
                height={300}
                margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
                grid={{ horizontal: true }}
                sx={{
                  '& .MuiAreaElement-series-ventas': {
                    fill: "url('#direct')",
                  },
                }}
                hideLegend
              >
                <AreaGradient color={theme.palette.primary.main} id="direct" />
              </LineChart>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

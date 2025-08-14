import * as React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Title from './Title';

import clienteAxios from '../src/context/Config';

// =====================
// Estilos y utilidades
// =====================
const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: { variant: 'primary' },
      style: { fontSize: theme.typography.h5.fontSize, fontWeight: theme.typography.h5.fontWeight },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: { fontSize: theme.typography.body2.fontSize, fontWeight: theme.typography.body2.fontWeight },
    },
  ],
}));

function PieCenterLabel({ primaryText, secondaryText }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </>
  );
}

PieCenterLabel.propTypes = {
  primaryText: PropTypes.string.isRequired,
  secondaryText: PropTypes.string.isRequired,
};

// Formatea un número con separadores de miles
const formatNumber = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('es-MX', { maximumFractionDigits: 0 })
    : '0';

// Formatea fecha a YYYY-MM-DD sin cambiar huso horario
const formatDate = (date) => {
  if (!(date instanceof Date)) return '';
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Genera una paleta HSL en tonos azules/grises para N porciones
const generatePalette = (n) => {
  // Base: hsl(220, 20–50%, 25–70%)
  const colors = [];
  for (let i = 0; i < n; i++) {
    const sat = 20 + Math.round((30 * i) / Math.max(1, n - 1)); // 20–50
    const light = 30 + Math.round((35 * (n - 1 - i)) / Math.max(1, n - 1)); // 65→30
    colors.push(`hsl(220, ${sat}%, ${light}%)`);
  }
  return colors;
};

// ======================
// Componente principal
// ======================
export default function ChartSalesByStatus() {
  const [fechaInicial, setFechaInicial] = React.useState(null);
  const [fechaFinal, setFechaFinal] = React.useState(null);

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [chartData, setChartData] = React.useState([]); // [{label, value}]
  const [totalSum, setTotalSum] = React.useState(0);

  const fetchData = React.useCallback(async (fInicial, fFinal) => {
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
        `/api/reportes/totales?fechaInicial=${fInicial}&fechaFinal=${fFinal}`,
        {},
        config
      );

      const arr = Array.isArray(response.data) ? response.data : [];

      // Normaliza porcentaje (acepta 0–1 o 0–100)
      const normalized = arr.map((item, idx) => {
        const origen = item?.origen ?? '';
        const estado = item?.estado ?? '';
        const etiqueta = `${origen} - ${estado}`.trim();
        let pct = Number(item?.porcentaje ?? 0);
        if (!Number.isFinite(pct)) pct = 0;
        // Si parece estar en 0–1, conviértelo a %
        if (pct > 0 && pct <= 1) pct = pct * 100;

        return {
          id: idx,
          label: etiqueta || `Registro ${idx + 1}`,
          value: pct, // El Pie usa el valor relativo; aquí usamos el porcentaje directo
          _total: Number(item?.total ?? 0),
        };
      });

      const sumTotal = normalized.reduce((acc, it) => acc + (Number(it._total) || 0), 0);

      // Guarda datos para el PieChart (solo label y value)
      setChartData(normalized.map(({ label, value }) => ({ label, value })));
      setTotalSum(sumTotal);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setErrorMsg('No se pudieron cargar los datos del reporte. Intenta de nuevo.');
      setChartData([]);
      setTotalSum(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial: últimos 30 días
  React.useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setFechaInicial(thirtyDaysAgo);
    setFechaFinal(today);
    fetchData(formatDate(thirtyDaysAgo), formatDate(today));
  }, [fetchData]);

  const handleBuscar = () => {
    if (!fechaInicial || !fechaFinal) {
      alert('Selecciona ambas fechas');
      return;
    }
    const fInicial = formatDate(fechaInicial);
    const fFinal = formatDate(fechaFinal);
    fetchData(fInicial, fFinal);
  };

  const palette = React.useMemo(() => generatePalette(chartData.length || 1), [chartData.length]);

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        {/* Calendarios y botón buscar */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
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

        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

      {/*   <Typography component="h2" variant="subtitle2" sx={{ mb: 1 }}>
          Ventas por Estatus 
        </Typography>*/}
        <Title>Ventas por Estatus</Title>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PieChart
            colors={palette}
            margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
            series={[
              {
                data: chartData,
                innerRadius: 75,
                outerRadius: 100,
                paddingAngle: 0,
                highlightScope: { fade: 'global', highlight: 'item' },
              },
            ]}
            height={260}
            width={260}
            hideLegend
          >
            <PieCenterLabel primaryText={`${formatNumber(totalSum)}`} secondaryText="Total" />
          </PieChart>
        </Box>

        {/* Barra de desglose (opcional, conserva estilo de tu diseño original) */}
        {chartData.map((item, idx) => {
          // Valor de barra en 0–100 para la barra de progreso
          const barValue = Math.max(0, Math.min(100, Number(item.value) || 0));
          return (
            <Stack
              key={`${item.label}-${idx}`}
              direction="row"
              sx={{ alignItems: 'center', gap: 2, pb: 2 }}
            >
              <Stack sx={{ gap: 1, flexGrow: 1 }}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {barValue.toFixed(2)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  aria-label={`Porcentaje de ${item.label}`}
                  value={barValue}
                  sx={{
                    [`& .${linearProgressClasses.bar}`]: {
                      backgroundColor: palette[idx % palette.length],
                    },
                  }}
                />
              </Stack>
            </Stack>
          );
        })}
      </CardContent>
    </Card>
  );
}

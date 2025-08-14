import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import Button from '@mui/material/Button';

function getDaysInMonth(month, year) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function renderSparklineCell(params) {
  const data = getDaysInMonth(4, 2024);
  const { value, colDef } = params;

  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <SparkLineChart
        data={value}
        width={colDef.computedWidth || 100}
        height={32}
        plotType="bar"
        showHighlight
        showTooltip
        color="hsl(210, 98%, 42%)"
        xAxis={{
          scaleType: 'band',
          data,
        }}
      />
    </div>
  );
}

function renderStatus(status) {
  const colors = {
    Online: 'success',
    Offline: 'default',
    Sí: 'success',
    Si: 'success',
    No: 'default',
    '': 'default',
    null: 'default',
  };

  return <Chip label={status} color={colors[status] || 'default'} size="small" />;
}

export function renderAvatar(params) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

// === Helper para descargar PDF desde base64 o byte[] ===
function downloadEtiqueta(value, fileName = 'etiqueta.pdf') {
  let blob;

  if (Array.isArray(value)) {
    const uint8 = new Uint8Array(value);
    blob = new Blob([uint8], { type: 'application/pdf' });
  } else if (typeof value === 'string') {
    let base64 = value;
    const match = base64.match(/^data:.*;base64,(.*)$/);
    if (match) base64 = match[1];
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    blob = new Blob([bytes], { type: 'application/pdf' });
  } else {
    console.warn('Formato de etiqueta no soportado:', typeof value);
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const columns = [
  {
    field: 'ventas_noventa',
    headerName: 'No Venta',
    flex: 0.5,
    minWidth: 150,
  },
  {
    field: 'origen',
    headerName: 'Origen Venta',
    flex: 0.5,
    minWidth: 150,
  },
  {
    field: 'ventas_fechaventa',
    headerName: 'Fecha Venta',
    flex: 0.5,
    minWidth: 150,
  },
  {
    field: 'ventas_estado',
    headerName: 'Ventas Estado',
    flex: 0.5,
    minWidth: 300,
    renderCell: (params) => {
      const isCancelada = (params.value || '').toLowerCase().includes('venta cancelada');
      const hasEmpacador = params.row?.empacador != null && params.row.empacador !== '';
  
      const shouldMarkRed = isCancelada && hasEmpacador;
  
      return (
        <div
          style={{
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            lineHeight: '1.2',
            padding: '4px 8px',
            fontWeight: shouldMarkRed ? 'bold' : 'normal',
            backgroundColor: shouldMarkRed ? '#f8d7da' : 'transparent',
            color: shouldMarkRed ? '#721c24' : 'inherit',
            borderRadius: shouldMarkRed ? '6px' : '0px',
          }}
        >
          {params.value}
        </div>
      );
    },
  },  
  {
    field: 'surtidor',
    headerName: 'Surtidor',
    flex: 0.5,
    minWidth: 150,
  },
  {
    field: 'empacador',
    headerName: 'Empacador',
    flex: 0.5,
    minWidth: 150,
  },
  {
    field: 'estadoVenta',
    headerName: 'Estado',
    flex: 0.5,
    minWidth: 125,
    renderCell: (params) => {
      const estado = params.value ?? '';
      let color = 'default';
      let textColor = '#000';
      let bgColor = '#e0e0e0';
  
      switch (estado.toUpperCase()) {
        case 'POR SURTIR':
          color = 'warning';
          bgColor = '#fff3cd'; 
          textColor = '#856404';
          break;
        case 'EMPACADO':
          color = 'info';
          bgColor = '#d1ecf1';
          textColor = '#0c5460';
          break;
        case 'SURTIDO':
          color = 'success';
          bgColor = '#d4edda'; 
          textColor = '#155724';
          break;
        default:
          bgColor = '#f8f9fa';
          textColor = '#6c757d';
          break;
      }
  
      return (
        <div
          style={{
            backgroundColor: bgColor,
            color: textColor,
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '8px',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {estado}
        </div>
      );
    },
  },  
  {
    field: 'etiqueta',
    headerName: 'Etiqueta',
    flex: 0.5,
    minWidth: 110,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const v = params.value;
      const hasBytes =
        (typeof v === 'string' && v.trim() !== '') ||
        (Array.isArray(v) && v.length > 0);

      if (!hasBytes) return '';

      const fileName = `etiqueta_${params.row?.ventas_noventa ?? 'documento'}.pdf`;

      const onClick = (e) => {
        e.stopPropagation(); // evita seleccionar la fila
        downloadEtiqueta(v, fileName);
      };

      return (
        <Button variant="outlined" size="small" onClick={onClick}>
          Descargar
        </Button>
      );
    },
  },
  {
    field: 'ventas_paquetevarios',
    headerName: 'Paquete Varios Productos',
    flex: 0.5,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value),
  },
  {
    field: 'ventas_unidades',
    headerName: 'Unidades',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 80,
    renderCell: (params) => {
      const valor = params.value ?? 0;
      return (
        <span
          style={{
            fontWeight: 'bold',
            color: valor > 0 ? '#1976d2' : '#555',
          }}
        >
          {valor}
        </span>
      );
    },
  },
  {
    field: 'ventas_descripcionestado',
    headerName: 'Descripción del estado',
    flex: 0.5,
    minWidth: 200,
  },
  {
    field: 'ventas_ingresosproducto',
    headerName: 'Ingresos Por producto',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'ventas_ingresosenvio',
    headerName: 'Ingresos envío',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'ventas_cargoventa',
    headerName: 'Cargo por Venta e insumos',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'ventas_costosenvio',
    headerName: 'Costos de envío',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'ventas_anulacionesreembolsos',
    headerName: 'Anulaciones y reembolsos (MXN)',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'ventas_totalmxn',
    headerName: 'Total (MXN)',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'publicidad_ventapublicidad',
    headerName: 'Venta por publicidad',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'publicaciones_sku',
    headerName: 'SKU',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'publicaciones_titulopublicacion',
    headerName: 'Título de la publicación',
    flex: 2,
    minWidth: 200,
  },
  {
    field: 'publicaciones_variante',
    headerName: 'Variante',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'publicaciones_tipopublicacion',
    headerName: 'Tipo de publicación',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'facturacion_facturaadjunta',
    headerName: 'Factura adjunta',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'facturacion_datospersonalesempresa',
    headerName: 'Datos personales o de empresa',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'facturacion_tiponumerodocumento',
    headerName: 'Tipo y número de documento',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'facturacion_direccion',
    headerName: 'Dirección',
    flex: 2,
    minWidth: 250,
  },
  {
    field: 'facturacion_tipocontribuyente',
    headerName: 'Tipo de contribuyente',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'facturacion_cfdi',
    headerName: 'CFDI',
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'facturacion_tipousuario',
    headerName: 'Tipo de usuario',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'facturacion_regimenfiscal',
    headerName: 'Régimen Fiscal',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'compradores_comprador',
    headerName: 'Comprador',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'compradores_ife',
    headerName: 'IFE',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'compradores_domicilio',
    headerName: 'Domicilio',
    flex: 2,
    minWidth: 200,
  },
  {
    field: 'compradores_municipioalcaldia',
    headerName: 'Municipio/Alcaldía',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'compradores_estado',
    headerName: 'Estado comprador',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'compradores_codigopostal',
    headerName: 'Código postal',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'compradores_pais',
    headerName: 'País',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'envios_formaentrega',
    headerName: 'Forma de entrega',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'envios_fechaencamino',
    headerName: 'Fecha en camino',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'envios_fechaentregado',
    headerName: 'Fecha entregado',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'envios_transportista',
    headerName: 'Transportista',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'envios_numeroseguimiento',
    headerName: 'Número de seguimiento',
    flex: 1,
    minWidth: 160,
  },
  {
    field: 'envios_urlseguimiento',
    headerName: 'URL de seguimiento',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'devoluciones_unidades',
    headerName: 'Unidades devueltas',
    flex: 1,
    minWidth: 80,
    headerAlign: 'right',
    align: 'right',
  },
  {
    field: 'devoluciones_formaentrega',
    headerName: 'Forma de entrega devolución',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'devoluciones_fechaencamino',
    headerName: 'Fecha en camino devolución',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'devoluciones_fechaentregado',
    headerName: 'Fecha entregado devolución',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'devoluciones_transportista',
    headerName: 'Transportista devolución',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'devoluciones_numeroseguimiento',
    headerName: 'Número de seguimiento devolución',
    flex: 1,
    minWidth: 160,
  },
  {
    field: 'devoluciones_urlseguimiento',
    headerName: 'URL de seguimiento devolución',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'reclamos_unidades',
    headerName: 'Unidades en reclamos',
    flex: 1,
    minWidth: 80,
    headerAlign: 'right',
    align: 'right',
  },
  {
    field: 'reclamos_reclamoabierto',
    headerName: 'Reclamo abierto',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'reclamos_reclamocerrado',
    headerName: 'Reclamo cerrado',
    flex: 1,
    minWidth: 130,
  },
  {
    field: 'reclamos_conmediacion',
    headerName: 'Con mediación',
    flex: 1,
    minWidth: 130,
  },
];

export const columnGroupingModel = [
  {
    groupId: 'ventas',
    headerName: 'Ventas',
    children: [
      { field: 'ventas_noventa' },
      { field: 'origen' },
      { field: 'ventas_fechaventa' },
      { field: 'ventas_estado' },
      { field: 'surtidor' },
      { field: 'empacador' },
      { field: 'estadoVenta' },
      { field: 'etiqueta' },
      { field: 'ventas_descripcionestado' },
      { field: 'ventas_paquetevarios' },
      { field: 'ventas_unidades' },
      { field: 'ventas_ingresosproducto' },
      { field: 'ventas_ingresosenvio' },
      { field: 'ventas_cargoventa' },
      { field: 'ventas_costosenvio' },
      { field: 'ventas_anulacionesreembolsos' },
      { field: 'ventas_totalmxn' },
    ],
  },
  {
    groupId: 'publicidad',
    headerName: 'Publicidad',
    headerClassName: 'group-publicidad',
    children: [{ field: 'publicidad_ventapublicidad' }],
  },
  {
    groupId: 'publicaciones',
    headerName: 'Publicaciones',
    children: [
      { field: 'publicaciones_sku' },
      { field: 'publicaciones_titulopublicacion' },
      { field: 'publicaciones_variante' },
      { field: 'publicaciones_tipopublicacion' },
    ],
  },
  {
    groupId: 'facturacion',
    headerName: 'Facturación',
    children: [
      { field: 'facturacion_facturaadjunta' },
      { field: 'facturacion_datospersonalesempresa' },
      { field: 'facturacion_tiponumerodocumento' },
      { field: 'facturacion_direccion' },
      { field: 'facturacion_tipocontribuyente' },
      { field: 'facturacion_cfdi' },
      { field: 'facturacion_tipousuario' },
      { field: 'facturacion_regimenfiscal' },
    ],
  },
  {
    groupId: 'compradores',
    headerName: 'Compradores',
    children: [
      { field: 'compradores_comprador' },
      { field: 'compradores_ife' },
      { field: 'compradores_domicilio' },
      { field: 'compradores_municipioalcaldia' },
      { field: 'compradores_estado' },
      { field: 'compradores_codigopostal' },
      { field: 'compradores_pais' },
    ],
  },
  {
    groupId: 'envios',
    headerName: 'Envíos',
    children: [
      { field: 'envios_formaentrega' },
      { field: 'envios_fechaencamino' },
      { field: 'envios_fechaentregado' },
      { field: 'envios_transportista' },
      { field: 'envios_numeroseguimiento' },
      { field: 'envios_urlseguimiento' },
    ],
  },
  {
    groupId: 'devoluciones',
    headerName: 'Devoluciones',
    children: [
      { field: 'devoluciones_unidades' },
      { field: 'devoluciones_formaentrega' },
      { field: 'devoluciones_fechaencamino' },
      { field: 'devoluciones_fechaentregado' },
      { field: 'devoluciones_transportista' },
      { field: 'devoluciones_numeroseguimiento' },
      { field: 'devoluciones_urlseguimiento' },
    ],
  },
  {
    groupId: 'reclamos',
    headerName: 'Reclamos',
    children: [
      { field: 'reclamos_unidades' },
      { field: 'reclamos_reclamoabierto' },
      { field: 'reclamos_reclamocerrado' },
      { field: 'reclamos_conmediacion' },
    ],
  },
];

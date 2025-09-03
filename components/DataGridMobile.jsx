import * as React from 'react';
import { Box, Button, Snackbar, Alert, 
  Card, CardContent, Stack, Typography, Chip, Divider,
  Select, MenuItem, InputLabel, FormControl, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress
} from '@mui/material';
import { columns } from '../internals/data/gridData';
import clienteAxios from '../src/context/Config';
import { useNavigate } from 'react-router-dom';
import { ButtonBase } from '@mui/material';

export default function DataGridMobile() {
  const navigate = useNavigate();

  const [filterModel, setFilterModel] = React.useState({ items: [] });
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [filterColumn, setFilterColumn] = React.useState('ventas_noventa');
  const [filterOperator, setFilterOperator] = React.useState('contains');
  const [filterValue, setFilterValue] = React.useState('');
  
  const [assigningEmpId, setAssigningEmpId] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  const [activeId, setActiveId] = React.useState(null); // <-- registro activo para el panel fijo

  // ====== Auto-refresh======
  const REFRESH_MS = 600000; // 10min
  const mountedRef = React.useRef(true);
  const isFetchingRef = React.useRef(false);
  const hasFetchedRef = React.useRef(false);

  // Empacadores
  const [empacadores, setEmpacadores] = React.useState([]);
  const empacadoresFetchedRef = React.useRef(false); 
  const [openEmp, setOpenEmp] = React.useState(false);
  const [selectedEmp, setSelectedEmp] = React.useState('');
  const [targetVentaId, setTargetVentaId] = React.useState(null);
  const [assigning, setAssigning] = React.useState(false);


  // Imágenes
  const [imagesByVenta, setImagesByVenta] = React.useState({});
  const [loadingImagesVenta, setLoadingImagesVenta] = React.useState(null);

  // ----- Visibilidad de columnas -----
  const columnVisibilityModel = React.useMemo(() => ({
    origen:false,
    ventas_descripcionestado: false,
    ventas_ingresosproducto: false,
    ventas_ingresosenvio: false,
    ventas_cargoventa: false,
    ventas_costosenvio: false,
    ventas_anulacionesreembolsos: false,
    ventas_totalmxn: false,
    publicidad_ventapublicidad: false,
    publicaciones_variante: false,
    publicaciones_tipopublicacion: false,
    facturacion_facturaadjunta: false,
    facturacion_datospersonalesempresa: false,
    facturacion_tiponumerodocumento: false,
    facturacion_direccion: false,
    facturacion_tipocontribuyente: false,
    facturacion_cfdi: false,
    facturacion_tipousuario: false,
    facturacion_regimenfiscal: false,
    compradores_comprador: false,
    compradores_ife: false,
    compradores_domicilio: false,
    compradores_municipioalcaldia: false,
    compradores_estado: false,
    compradores_codigopostal: false,
    compradores_pais: false,
    envios_formaentrega: false,
    envios_fechaencamino: false,
    envios_fechaentregado: false,
    envios_transportista: false,
    envios_numeroseguimiento: false,
    envios_urlseguimiento: false,
    devoluciones_unidades: false,
    devoluciones_formaentrega: false,
    devoluciones_fechaencamino: false,
    devoluciones_fechaentregado: false,
    devoluciones_transportista: false,
    devoluciones_numeroseguimiento: false,
    devoluciones_urlseguimiento: false,
    reclamos_unidades: false,
    reclamos_reclamoabierto: false,
    reclamos_reclamocerrado: false,
    reclamos_conmediacion: false,
  }), []);

  // Filas con “detalle expandido”
  const [expandedRows, setExpandedRows] = React.useState(() => new Set());
  const toggleRowDetails = React.useCallback((id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const allNonHiddenColumns = React.useMemo(
    () => columns.filter(col => col.hide !== true),
    []
  );

  const getAvailableOperators = (field) => {
    const col = columns.find((c) => c.field === field);
    if (col?.type === 'number') {
      return ['=', '!=', '>', '>=', '<', '<='];
    }
    return ['contains', 'equals', 'startsWith', 'endsWith'];
  };

  const fetchData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await clienteAxios.get('/api/ventas/consulta', config);
      const dataWithId = response.data.map((item) => ({
        id: item.idmercadolibre,
        ...item,
      }));
      if (mountedRef.current) {
        setRows(dataWithId);
        if (!activeId && dataWithId.length) {
          setActiveId(dataWithId[0].id);
        }
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate('/');
      } else {
        console.error('Error cargando datos:', error);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
      isFetchingRef.current = false;
    }
  };

  React.useEffect(() => {
    if (empacadoresFetchedRef.current) return;
    empacadoresFetchedRef.current = true;
      const cached = localStorage.getItem('empacadoresCache');
    if (cached) {
      try { setEmpacadores(JSON.parse(cached)); } catch {}
    }
    const fetchEmpacadores = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await clienteAxios.get('/api/empacador/consulta', config);
        const activos = response.data.filter(emp => emp.empacador_activo);
        localStorage.setItem('empacadoresCache', JSON.stringify(activos));
        setEmpacadores(activos);
      } catch (e) {
        console.error('Error cargando empacadores:', e);
      }
    };
  
    fetchEmpacadores();
  }, []);
  
  const openEmpacadorModal = (ventaId) => {
    setTargetVentaId(ventaId);
    setSelectedEmp('');
    setOpenEmp(true);
  };
  
  const closeEmpacadorModal = () => {
    setOpenEmp(false);
    setSelectedEmp('');
    setTargetVentaId(null);
  };

  const handleAsignarEmpacador = async () => {
    if (!selectedEmp || !targetVentaId) {
      setSnackbar({ open: true, message: 'Selecciona un empacador válido', severity: 'warning' });
      return;
    }
    setAssigning(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
  
      const queryParams = [
        `idempacador=${encodeURIComponent(parseInt(selectedEmp, 10))}`,
        `idmercadolibre=${encodeURIComponent(targetVentaId)}`
      ].join('&');
  
      await clienteAxios.post(`/api/empacador/asignarEmpacador?${queryParams}`, {}, config);
      const selectedName =
      empacadores.find(e => e.id_empacador === parseInt(selectedEmp, 10))?.empacador_nombre
      ?? 'Asignado';

      setRows(prev =>
          prev.map(r =>
          r.id === targetVentaId
              ? { ...r, empacador: selectedName }
              : r
          )
      );

      setSnackbar({ open: true, message: 'Empacador asignado correctamente', severity: 'success' });
    } catch (e) {
      console.error('Error al asignar empacador', e);
      setSnackbar({ open: true, message: 'Error al asignar empacador', severity: 'error' });
    } finally {
      setAssigning(false);
      closeEmpacadorModal();
    }
  };  
  function downloadEtiqueta(value, fileName = 'Etiqueta.pdf', mime = 'application/pdf') {
    let blob;
  
    if (value instanceof Blob) {
      blob = value.type ? value : new Blob([value], { type: mime });
    } else if (value instanceof ArrayBuffer) {
      blob = new Blob([new Uint8Array(value)], { type: mime });
    } else if (ArrayBuffer.isView(value)) { 
      blob = new Blob([value], { type: mime });
    } else if (Array.isArray(value)) {
      blob = new Blob([new Uint8Array(value)], { type: mime });
    } else if (typeof value === 'string') {
      let base64 = value;
      const m = base64.match(/^data:([^;]+);base64,(.*)$/);
      const b64 = m ? m[2] : base64;
      const binary = atob(b64);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      blob = new Blob([bytes], { type: mime });
    } else {
      console.warn('Formato de etiqueta no soportado:', typeof value, value);
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

  React.useEffect(() => {
    mountedRef.current = true;
    if (!hasFetchedRef.current) {
      fetchData();
      hasFetchedRef.current = true;
    }
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchData();
      }
    }, REFRESH_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);  

  // ====== FILTRO======
  const handleApplyFilter = () => {
    setFilterModel({
      items: [
        {
          id: 1,
          field: filterColumn,
          operator: filterOperator,
          value: filterValue,
        },
      ],
    });
  };

  const applyFilterToRows = React.useCallback((data) => {
    if (!filterModel?.items?.length) return data;
    const { field, operator, value } = filterModel.items[0] || {};
    if (!field || !operator) return data;

    const raw = (v) => (v === null || v === undefined) ? '' : String(v);
    const isNumericOp = ['=', '!=', '>', '>=', '<', '<='].includes(operator);

    return data.filter((row) => {
      const cell = row[field];
      if (isNumericOp) {
        const numCell = Number(cell);
        const numVal = Number(value);
        if (Number.isNaN(numCell) || Number.isNaN(numVal)) return false;
        switch (operator) {
          case '=': return numCell === numVal;
          case '!=': return numCell !== numVal;
          case '>': return numCell > numVal;
          case '>=': return numCell >= numVal;
          case '<': return numCell < numVal;
          case '<=': return numCell <= numVal;
          default: return true;
        }
      } else {
        const s = raw(cell).toLowerCase();
        const q = raw(value).toLowerCase();
        switch (operator) {
          case 'contains': return s.includes(q);
          case 'equals': return s === q;
          case 'startsWith': return s.startsWith(q);
          case 'endsWith': return s.endsWith(q);
          default: return true;
        }
      }
    });
  }, [filterModel]);

  const isRowDisabledByRule = (row) => !!(row.surtidor);
  const isRowSelectable = (row) => !isRowDisabledByRule(row);

  const visibleColumns = React.useMemo(() => {
    return columns.filter((col) => {
      const hiddenByModel = columnVisibilityModel[col.field] === false;
      const hiddenByCol = col.hide === true;
      return !(hiddenByModel || hiddenByCol);
    });
  }, [columnVisibilityModel]);

  const displayedRows = applyFilterToRows(rows);

  const getSessionUserName = () => {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      return obj.name || obj.nombre || obj.username || obj.user || obj.email || raw;
    } catch {
      return raw;
    }
  };

  const handleAsignarSurtidor = async (id) => {
    if (!id) {
      setSnackbar({ open: true, message: 'Id de venta inválido', severity: 'warning' });
      return;
    }
    try {
      setAssigningEmpId(id);  
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const queryParams = `idmercadolibre=${encodeURIComponent(id)}`;
      await clienteAxios.post(`/api/ventas/asignarSurtidor?${queryParams}`, {}, config);

      const sessionName = getSessionUserName() ?? 'Asignado';
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, surtidor: sessionName } : r))
      );
  
      setSnackbar({ open: true, message: 'Surtidor asignado correctamente', severity: 'success' });
    } catch (error) {
      if (error?.response?.status === 401) {
        const msg = error.response?.data?.error || 'Perfil no correspondiente a Surtidor.';
        setSnackbar({ open: true, message: msg, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Error al asignar Surtidor', severity: 'error' });
      }
    } finally {
      setAssigningEmpId(null);
    }
  };
  function toImageSrc(value, mimeHint) {
    if (!value) return null;
  
    // 1) Strings
    if (typeof value === 'string') {
      // Si ya viene como URL o data URL
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
        return value;
      }
      // Quita encabezado si viene incrustado y normaliza
      const b64 = value.replace(/^data:[^;]+;base64,/, '');
      // Heurística de mime si no viene explícito
      const guess =
        mimeHint ||
        (b64.startsWith('/9j/') ? 'image/jpeg'
          : b64.startsWith('iVBOR') ? 'image/png'
          : b64.startsWith('R0lGOD') ? 'image/gif'
          : b64.startsWith('UklGR') ? 'image/webp'
          : 'image/jpeg');
  
      return `data:${guess};base64,${b64}`;
    }
  
    // 2) Arrays o buffers
    const toU8 = (v) => {
      if (Array.isArray(v)) return new Uint8Array(v);
      if (v instanceof ArrayBuffer) return new Uint8Array(v);
      if (ArrayBuffer.isView(v)) return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
      return null;
    };
    const u8 = toU8(value);
    if (u8) {
      const type = mimeHint || 'image/jpeg';
      const blob = new Blob([u8], { type });
      return URL.createObjectURL(blob);
    }
  
    // 3) Objetos con diferentes llaves
    if (typeof value === 'object') {
      const type = value.mimeType || value.mimetype || value.contentType || mimeHint;
      const payload =
        value.url || value.href || value.imagen || value.image || value.foto || value.bytes || value.data || value.src;
      return toImageSrc(payload, type);
    }
  
    return null;
  }
  
  async function fetchImagenesOrden(noVenta,sku) {
    if (!noVenta) return;
    try {
      setLoadingImagesVenta(noVenta);
  
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const  { data } = await clienteAxios.get(
        `/api/archivos/imagenesOrden?noVenta=${noVenta}&sku=${sku}`,
        {},
        config
      );
  
      const list =
        Array.isArray(data) ? data :
        data?.items || data?.imagenes || data?.results || [];
  
      const normalized = list.map((it, idx) => {
        const sku =
          it.sku ?? it.SKU ?? it.skuProducto ?? it.producto ?? it.codigo ?? it.id ?? `SKU_${idx + 1}`;
  
        const mime =
          it.mimeType || it.mimetype || it.contentType || it.tipo || undefined;
  
        const src = toImageSrc(
          it.url || it.href || it.imagen || it.image || it.foto || it.bytes || it.data || it.src,
          mime
        );
  
        if (!src) {
          console.warn('Imagen sin src normalizable:', it);
        }
  
        return { sku, src };
      }).filter(x => x.src);
  
      setImagesByVenta(prev => ({ ...prev, [noVenta]: normalized }));
    } catch (err) {
      console.error('Error obteniendo imágenes de la orden:', err);
      setSnackbar({ open: true, message: 'No se pudieron cargar las imágenes del pedido', severity: 'error' });
    } finally {
      setLoadingImagesVenta(null);
    }
  }
  

  // Anchos fijos
  const LABEL_WIDTH = 128;

  const labelSx = React.useMemo(
    () => ({
      fontWeight: 600,
      flex: `0 0 ${LABEL_WIDTH}px`,
      minWidth: LABEL_WIDTH,
      maxWidth: LABEL_WIDTH,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    []
  );

  const rowLineSx = { display: 'flex', alignItems: 'flex-start', gap: 0 };

  const valueSx = {
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    flex: 1,
    minWidth: 0,
  };


  React.useEffect(() => {
    if (loading || !activeId) return;
    const activeRow = rows.find(r => r.id === activeId);
    const noVenta = activeRow?.ventas_noventa;
    const sku = activeRow?.publicaciones_sku;
    if (!noVenta) return;
    if (imagesByVenta[noVenta]) return;
    fetchImagenesOrden(noVenta,sku);
  }, [activeId, loading, rows, imagesByVenta]); 

  return (
    <Box>
      {/* Filtros */}
      <br/><FormControl sx={{ minWidth: 180, mr: 1 }} size="small">
        <InputLabel>Columna</InputLabel>
        <Select
          value={filterColumn}
          label="Columna"
          onChange={(e) => {
            const nuevaColumna = e.target.value;
            setFilterColumn(nuevaColumna);
            const operadores = getAvailableOperators(nuevaColumna);
            setFilterOperator(operadores[0]);
          }}
        >
          {columns.map((col) => (
            <MenuItem key={col.field} value={col.field}>
              {col.headerName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 160, mr: 1 }} size="small">
        <InputLabel>Operador</InputLabel>
        <Select
          value={filterOperator}
          label="Operador"
          onChange={(e) => setFilterOperator(e.target.value)}
        >
          {getAvailableOperators(filterColumn).map((op) => (
            <MenuItem key={op} value={op}>
              {op}
            </MenuItem>
          ))}
        </Select>
      </FormControl><br/><br/>

      <TextField
        size="small"
        label="Valor"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleApplyFilter();
          }
        }}
        sx={{ mr: 1 }}
      /><br/><br/>

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleApplyFilter}
        disabled={!filterValue}
        sx={{ mr: 1, mt: { xs: 1, sm: 0 } }}
      >
        Aplicar Filtro
      </Button>

      <Button
        variant="outlined"
        color="success"
        onClick={() => {
          setFilterValue('');
          setFilterColumn('ventas_noventa');
          setFilterOperator('contains');
          setFilterModel({ items: [] });
        }}
        sx={{ mt: { xs: 1, sm: 0 } }}
      >
        Limpiar Filtro
      </Button>

      <Box
        sx={{
          mt: 2,
          display: 'flex',
          position: 'relative',
        }}
      >

<Box sx={{ mt: 2 }}>
  <Box
    sx={{
      display: 'flex',
      overflowX: 'auto',
      scrollSnapType: 'x mandatory',
      gap: 0,                    
      px: 0,
      '&::-webkit-scrollbar': { display: 'none' },
      msOverflowStyle: 'none',   
      scrollbarWidth: 'none',
      width: '100vw',           
      maxWidth: '100vw',
    }}
  >
    {loading ? (
    <Box
        sx={{
        width: '100vw',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        gap: 1,
        }}
        aria-live="polite"
    >
        <CircularProgress size={28} />
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
        Cargando ventas...
        </Typography>
    </Box>
    ) : displayedRows.length === 0 ? (
    <Box sx={{ p: 2, width: '100vw' }}>
        <Typography variant="body2">Sin resultados</Typography>
    </Box>
    ) : (
      displayedRows.map((row, idx) => {
        const isActive   = row.id === activeId;
        const isExpanded = expandedRows.has(row.id);
        const colsToRender = isExpanded ? allNonHiddenColumns : visibleColumns;
        const isML = String(row.origen || '').toUpperCase() === 'MERCADO LIBRE';

        return (
          <Card
            key={row.id ?? idx}
            variant="outlined"
            onClick={() => setActiveId(row.id)}
            sx={{
              flex: '0 0 100%',
              width: '100vw',
              maxWidth: '100vw',
              scrollSnapAlign: 'start',
              borderRadius: 0,
              borderColor: isActive ? 'primary.main' : 'divider',
              borderWidth: isActive ? 2 : 1,
              boxSizing: 'border-box',
            }}
          >
            <CardContent sx={{ p: 2, boxSizing: 'border-box' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <ButtonBase
                  onClick={(e) => { e.stopPropagation(); setActiveId(row.id); toggleRowDetails(row.id); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: isML ? '#f8f32b' : 'transparent',
                    color: isML ? '#856404' : 'inherit',
                    overflow: 'hidden',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  aria-label={`Alternar detalle de venta ${row.ventas_noventa ?? row.id}`}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 700,
                    }}
                  >
                    {row.ventas_noventa ?? row.id ?? `#${idx + 1}`}
                  </Typography>
                </ButtonBase>
              </Stack>
        
              <Divider sx={{ mb: 1 }} />
              <Chip label={row.ventas_estado ?? '—'} size="small" /><br/><br/>
        
              <Stack spacing={0.5}>
                {colsToRender.map((col) => {
                  const label = col.headerName ?? col.field;
                  let value = row[col.field];
        
                  if (col.valueGetter) {
                    try { value = col.valueGetter({ row, value, field: col.field }); } catch {}
                  }
                  if (col.valueFormatter) {
                    try { value = col.valueFormatter({ value, field: col.field, id: row.id, api: null }); } catch {}
                  }
        
                  // --- Campo: Surtidor ---
                  if (col.field === 'surtidor') {
                    const hasSurtidor = value !== null && value !== undefined && String(value).trim() !== '';
                    return (
                      <Box key={col.field} sx={rowLineSx}>
                        <Typography variant="body2" sx={labelSx}>
                          {label}:
                        </Typography>
                        {hasSurtidor ? (
                          <Typography variant="body2" sx={valueSx}>
                            {String(value)}
                          </Typography>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            disabled={assigningEmpId === row.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAsignarSurtidor(row.id);
                            }}
                          >
                            {assigningEmpId === row.id ? 'Asignando…' : 'Asignar'}
                          </Button>
                        )}
                      </Box>
                    );
                  }
        
                  // --- Campo: Empacador ---
                  if (col.field === 'empacador') {
                    const hasEmp = value !== null && value !== undefined && String(value).trim() !== '';
                    return (
                      <Box key={col.field} sx={rowLineSx}>
                        <Typography variant="body2" sx={labelSx}>
                          {label}:
                        </Typography>
                        {hasEmp ? (
                          <Typography variant="body2" sx={valueSx}>
                            {String(value)}
                          </Typography>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEmpacadorModal(row.id);
                            }}
                          >
                            Asignar
                          </Button>
                        )}
                      </Box>
                    );
                  }
        
                  // --- Campo: Etiqueta (boolean) ---
                  if (col.field === 'etiqueta') {
                    const hasEtiqueta = Boolean(row[col.field]);
                    const fileName = `etiqueta_${row.ventas_noventa ?? 'documento'}.pdf`;
        
                    return (
                      <Box key={col.field} sx={rowLineSx}>
                        <Typography variant="body2" sx={labelSx}>
                          {label}:
                        </Typography>
        
                        {hasEtiqueta ? (
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const noVenta = row?.ventas_noventa;
                                if (!noVenta) {
                                  setSnackbar({ open: true, message: 'No. de venta inválido', severity: 'warning' });
                                  return;
                                }
                                const token =
                                  localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
                                const res = await clienteAxios.get('/api/archivos/etiqueta', {
                                  params: { noVenta },
                                  responseType: 'blob',
                                  headers: {
                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                    Accept: 'application/pdf',
                                  },
                                });
        
                                downloadEtiqueta(res.data, fileName);
                              } catch (err) {
                                console.error('Error descargando etiqueta:', err);
                                setSnackbar({ open: true, message: 'No se pudo descargar la etiqueta', severity: 'error' });
                              }
                            }}
                          >
                            Descargar
                          </Button>
                        ) : (
                          <Typography variant="body2" sx={valueSx}>
                            —
                          </Typography>
                        )}
                      </Box>
                    );
                  }
        
                  // --- Default ---
                  return (
                    <Box key={col.field} sx={rowLineSx}>
                      <Typography
                        variant="body2"
                        sx={labelSx}
                      >
                        {label}:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={valueSx}
                      >
                        {value === null || value === undefined || value === '' ? '—' : String(value)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
              {/* ====== Productos (SKU / Imagen) — solo para la venta activa ====== */}
              {row.id === activeId && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Productos
                  </Typography>

                  {/* Loader mientras carga esa venta */}
                  {loadingImagesVenta === row.ventas_noventa ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Cargando imágenes...</Typography>
                    </Box>
                  ) : (
                    (() => {
                      const items = imagesByVenta[row.ventas_noventa] || [];
                      if (!items.length) {
                        return (
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            Sin imágenes para esta venta.
                          </Typography>
                        );
                      }

                      // “Tabla” simple para móvil
                      return (
                        <Box
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          {/* Header */}
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 96px',
                              px: 1,
                              py: 0.5,
                              bgcolor: 'action.hover',
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              SKU
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'center' }}>
                              Imagen
                            </Typography>
                          </Box>

                          {/* Rows */}
                          {items.map((it, i) => (
                            <Box
                              key={`${it.sku}-${i}`}
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 96px',
                                alignItems: 'center',
                                px: 1,
                                py: 0.75,
                                borderTop: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography variant="body2" sx={{ pr: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {it.sku}
                              </Typography>

                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Box
                                  component="img"
                                  src={it.src}
                                  alt={`SKU ${it.sku}`}
                                  onError={(e) => {
                                    console.warn('No se pudo mostrar imagen para', it.sku, it.src);
                                    e.currentTarget.src = ''; // evita ícono roto
                                    e.currentTarget.style.opacity = 0.3;
                                    e.currentTarget.title = 'Imagen no disponible';
                                  }}
                                  sx={{
                                    width: 64,
                                    height: 64,
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                  }}
                                  loading="lazy"
                                  draggable={false}
                                />

                              </Box>
                            </Box>
                          ))}
                        </Box>
                      );
                    })()
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })
    )}
  </Box>
</Box>

      </Box>
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

        <Dialog open={openEmp} onClose={closeEmpacadorModal} fullWidth maxWidth="sm">
        <DialogTitle>Selecciona Empacador</DialogTitle>
        <DialogContent>
            <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="empacador-label">Empacador</InputLabel>
            <Select
                labelId="empacador-label"
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
                label="Empacador"
            >
                {empacadores.map(emp => (
                <MenuItem key={emp.id_empacador} value={emp.id_empacador}>
                    {emp.empacador_nombre} - {emp.empacador_correo}
                </MenuItem>
                ))}
            </Select>
            </FormControl>
        </DialogContent>
        <DialogActions>
            <Button onClick={closeEmpacadorModal}>Cerrar</Button>
            <Button
            onClick={handleAsignarEmpacador}
            disabled={!selectedEmp || assigning}
            variant="contained"
            color="primary"
            >
            {assigning ? 'Asignando...' : 'Asignar'}
            </Button>
        </DialogActions>
        </Dialog>

    </Box>
  );
}

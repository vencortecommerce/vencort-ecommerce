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
import { Link } from 'react-router-dom';

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
    publicaciones_sku: false,
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
  }, [columns, columnVisibilityModel]);

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
        const selected = selectedIds.includes(row.id);
        const disabled = !isRowSelectable(row);
        const isActive = row.id === activeId;

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
            {(() => {
                const isML = String(row.origen || '').toUpperCase() === 'MERCADO LIBRE';
                return (
                <Typography
                    variant="h6"
                    component={Link}
                    to={`/venta/${row.id}`}
                    sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'inline-block',
                    textDecoration: 'none',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: isML ? '#f8f32b' : 'transparent',
                    color: isML ? '#856404' : 'inherit',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 700,
                    }}
                    aria-label={`Ver detalle de venta ${row.ventas_noventa ?? row.id}`}
                >
                    {row.ventas_noventa ?? row.id ?? `#${idx + 1}`}
                </Typography>
                );
            })()}

            
            </Stack>
              <Divider sx={{ mb: 1 }} />
              <Chip label={row.ventas_estado ?? '—'} size="small" /><br/><br/>

              <Stack spacing={0.5}>
                {visibleColumns.map((col) => {
                  const label = col.headerName ?? col.field;
                  let value = row[col.field];
                  if (col.valueGetter) {
                    try { value = col.valueGetter({ row, value, field: col.field }); } catch {}
                  }
                  if (col.valueFormatter) {
                    try { value = col.valueFormatter({ value, field: col.field, id: row.id, api: null }); } catch {}
                  }
                if (col.field === 'surtidor') {
                    const hasSurtidor = value !== null && value !== undefined && String(value).trim() !== '';
                    return (
                    <Box key={col.field} sx={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 96, flexShrink: 0 }}>
                        {label}:
                        </Typography>
                
                        {hasSurtidor ? (
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
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
                if (col.field === 'empacador') {
                    const hasEmp = value !== null && value !== undefined && String(value).trim() !== '';
                    return (
                    <Box key={col.field} sx={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 96, flexShrink: 0 }}>
                        {label}:
                        </Typography>
                
                        {hasEmp ? (
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
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
                if (col.field === 'etiqueta') {
                  const hasEtiqueta = Boolean(row[col.field]); // ahora es booleano
                  const label = col.headerName ?? col.field;
                  const fileName = `etiqueta_${row.ventas_noventa ?? 'documento'}.pdf`;
                
                  return (
                    <Box key={col.field} sx={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 96, flexShrink: 0 }}>
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
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
                          —
                        </Typography>
                      )}
                    </Box>
                  );
                }
                
                return (
                    <Box key={col.field} sx={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, minWidth: 96, flexShrink: 0 }}
                      >
                        {label}:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere', flex: 1, minWidth: 0 }}
                      >
                        {value === null || value === undefined || value === '' ? '—' : String(value)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
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

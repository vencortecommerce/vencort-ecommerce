import * as React from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { columns, columnGroupingModel } from '../internals/data/gridData';
import clienteAxios from '../src/context/Config';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, InputLabel, FormControl,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function CustomizedDataGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [assigning, setAssigning] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success', });

  const navigate = useNavigate();
  const [filterColumn, setFilterColumn] = React.useState('ventas_noventa');
  const [filterOperator, setFilterOperator] = React.useState('contains');
  const [filterValue, setFilterValue] = React.useState('');
  const [filterModel, setFilterModel] = React.useState({ items: [] });
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

  const getAvailableOperators = (field) => {
    const col = columns.find((c) => c.field === field);
    if (col?.type === 'number') {
      return ['=', '!=', '>', '>=', '<', '<='];
    }
    return ['contains', 'equals', 'startsWith', 'endsWith'];
  };

  const operatorOptions = getAvailableOperators(filterColumn);

  // ====== Auto-refresh======
  const REFRESH_MS = 600000; // 5min
  const mountedRef = React.useRef(true);
  const isFetchingRef = React.useRef(false);

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
      if (mountedRef.current) setRows(dataWithId);
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate('/');
      }else{
        console.error('Error cargando datos:', error);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
      isFetchingRef.current = false;
    }
  };

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
      setEmpacadores(activos);
    } catch (error) {
      console.error(':', error);
      setSnackbar({ open: true, message: 'No se encontró información de Empacadores', severity: 'error' });
    }
  };

  React.useEffect(() => {
    mountedRef.current = true;
    fetchData();  
    fetchEmpacadores();

    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchData();
      }
    }, REFRESH_MS);

    const onVisibility = () => { if (!document.hidden) fetchData(); };
    const onFocus = () => fetchData();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, []);  

  const handleAsignarSurtidor = async () => {
    setAssigning(true);
    try {
      const idArray = Array.from(selectedIds?.ids ?? []);
      const queryParams = idArray.map((id) => `idmercadolibre=${id}`).join('&');
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await clienteAxios.post(`/api/ventas/asignarSurtidor?${queryParams}`, {}, config);
      setSnackbar({ open: true, message: 'Procesado correctamente', severity: 'success' });

      await fetchData();
      setSelectedIds([]);
    } catch (error) {
      if (error.response?.status === 401) {
        const errorMessage = error.response.data?.error || 'Perfil no correspondiente a Surtidor .';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Error al procesar la solicitud', severity: 'error' });
      }
    } finally {     
      setAssigning(false);
    }
  };

  const canntAssignSurtidor = () => {
    const idArray = Array.from(selectedIds?.ids ?? []);
    if (idArray.length === 0) {
      return false;
    }
    for (const id of idArray) {
      const row = rows.find((r) => r.id === id);
      if (row && row.surtidor) {
        return true;
      }
    }
    return false;
  };

  return (
    <Box ><br/>
    <FormControl sx={{ minWidth: 180 }} size="small">
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
  
    <FormControl sx={{ minWidth: 160 }} size="small">
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
    </FormControl>
  
    <TextField
      size="small"
      label="Valor"
      value={filterValue}
      onChange={(e) => setFilterValue(e.target.value)}
    />
 
      <Button
      variant="outlined"
      color="secondary"
      onClick={handleApplyFilter}
      disabled={!filterValue}
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
    >
      Limpiar Filtro
    </Button>
      <br/><br/>
      <DataGrid
        checkboxSelection
        rows={rows}
        columns={columns}
        columnGroupingModel={columnGroupingModel}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
          columns: {
            columnVisibilityModel: {
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
            },
          },
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        density="compact"
        loading={loading}
        filterModel={filterModel}
        isRowSelectable={(params) => !(params.row.surtidor && params.row.empacador)}
        onRowSelectionModelChange={(ids) => { 
          setSelectedIds(ids); }}
        slotProps={{
          filterPanel: {
            filterFormProps: {
              logicOperatorInputProps: { variant: 'outlined', size: 'small' },
              columnInputProps: { variant: 'outlined', size: 'small', sx: { mt: 'auto' } },
              operatorInputProps: { variant: 'outlined', size: 'small', sx: { mt: 'auto' } },
              valueInputProps: { InputComponentProps: { variant: 'outlined', size: 'small' } },
            },
          },
        }}
      />

      <Box mt={2} display="flex" gap={2}>
        <Button
          variant="contained"
          color="success"
          disabled={assigning || !selectedIds?.ids || selectedIds.ids.size === 0 || canntAssignSurtidor()}
          onClick={handleAsignarSurtidor}
        >
          {assigning ? 'Procesando...' : 'Asignar Surtidor'}
        </Button>
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
      
    </Box>
  );
}

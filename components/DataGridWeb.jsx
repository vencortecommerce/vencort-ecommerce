import React, { useState } from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { columns, columnGroupingModel } from '../internals/data/gridData';
import clienteAxios from '../src/context/Config';
import {
  Select, MenuItem, InputLabel, FormControl,
  TextField, FormControlLabel, Checkbox
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function DataGridWeb() {
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
    // ====== Auto-refresh======
    const REFRESH_MS = 600000; // 10min
    const mountedRef = React.useRef(true);
    const isFetchingRef = React.useRef(false);
    const hasFetchedRef = React.useRef(false); 
    // ====== Descarga de Másivos======  
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [mostrarEtiqueta, setMostrarEtiqueta] = useState(false);
    
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
            id: item.ventas_noventa,
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
    
    const getAvailableOperators = (field) => {
        const col = columns.find((c) => c.field === field);
        if (col?.type === 'number') {
          return ['=', '!=', '>', '>=', '<', '<='];
        }
        return ['contains', 'equals', 'startsWith', 'endsWith'];
    };
    /**DESCARGA DE ARCHIVOS MÁSIVO */
    const handleDownload = async () => {
      if(mostrarEtiqueta && mostrarDetalle){
        alert('Solo se permite seleccionar una opción');
      }else if(mostrarEtiqueta){
        handleDownloadEtiqueta();
      }else if(mostrarDetalle){
        handleDownloadDetalle();
      }else{
        alert('Selecciona una opción.');
      }
    }

    const handleDownloadEtiqueta = async () => {
        try {
          const idArray = Array.from(selectedIds?.ids ?? []);
          const queryParams = idArray.map((id) => `noVenta=${id}`).join('&');
          
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          const res = await clienteAxios.get(`/api/archivos/etiquetaMasivo?${queryParams}`, {
            responseType: 'blob',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              Accept: 'application/pdf',
            },
          });  
          download(res.data, 'Etiqueta.pdf');
        } catch (error) {
          if (error?.response?.status === 401) {
            navigate('/');
          }else{
            alert('No se encontraron Etiquetas disponibles para descargar.');
          }
        }
    };

    const handleDownloadDetalle = async () => {
      try {
        const idArray = Array.from(selectedIds?.ids ?? []);
        const queryParams = idArray.map((id) => `noVenta=${id}`).join('&');
        
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const res = await clienteAxios.get(`/api/archivos/etiquetaMasivo?${queryParams}`, {
          responseType: 'blob',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            Accept: 'application/pdf',
          },
        });  
        download(res.data, 'Detalle.pdf');
      } catch (error) {
        if (error?.response?.status === 401) {
          navigate('/');
        }else{
          alert('No se encontraron Detalles disponibles para descargar.');
        }
      }
    };

      function download(value, fileName = 'Archivo.pdf', mime = 'application/pdf') {
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
          console.warn('Formato de Archivo no soportado:', typeof value, value);
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
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyFilter();
                }
            }}
        />
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
        <br></br> <br></br>
        <FormControlLabel
          control={
            <Checkbox
              checked={mostrarDetalle}
              onChange={(e) => {
                const checked = e.target.checked;
                setMostrarDetalle(checked);
                if (checked) setMostrarEtiqueta(false); 
              }}
            />
          }
          label="Detalle"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={mostrarEtiqueta}
              onChange={(e) => {
                const checked = e.target.checked;
                setMostrarEtiqueta(checked);
                if (checked) setMostrarDetalle(false);
              }}
            />
          }
          label="Etiqueta"
        />
        <Button
          variant="outlined"
          color={(!mostrarDetalle ) ? 'error' : 'secondary'}
          startIcon={<FileDownloadIcon />}
          disabled={ !selectedIds?.ids || selectedIds.ids.size === 0 || (!mostrarDetalle && !mostrarEtiqueta) }
          onClick={handleDownload}
        >
          Descargar Detalle
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
        onFilterModelChange={(newModel) => setFilterModel(newModel)}
        isRowSelectable={(params) => (Boolean(params.row.detalle) || Boolean(params.row.etiqueta))}
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
    </Box>);
}
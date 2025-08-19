import * as React from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { columns, columnGroupingModel } from '../internals/data/gridData';
import clienteAxios from '../src/context/Config';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function CustomizedDataGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [assigning, setAssigning] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success', });
  const [openEmpacadorModal, setOpenEmpacadorModal] = React.useState(false);
  const [empacadores, setEmpacadores] = React.useState([]);
  const [selectedEmpacador, setSelectedEmpacador] = React.useState('');
  const navigate = useNavigate();

  // ====== Auto-refresh======
  const REFRESH_MS = 60000; // 60s
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
      console.error('Error al cargar empacadores:', error);
      setSnackbar({ open: true, message: 'Error al cargar empacadores', severity: 'error' });
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

  const handleAsignarEmpacador = async () => {
    setAssigning(true);
    const idArray = Array.from(selectedIds?.ids ?? []);
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
  
    const queryParams = [`idempacador=${selectedEmpacador}`, ...idArray.map(id => `idmercadolibre=${id}`)].join('&');
  
    try {
      const response = await clienteAxios.post(`/api/empacador/asignarEmpacador?${queryParams}`, {}, config);
      setSnackbar({ open: true, message: 'Empacador asignado correctamente', severity: 'success' });

      // 🔁 Actualiza la tabla principal sin refresh
      await fetchData();
      setSelectedIds([]);
      setOpenEmpacadorModal(false);
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

  const handleOpenEmpacadorModal = () => {
    setOpenEmpacadorModal(true);
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

  const canAssignEmpacador = () => {
    const idArray = Array.from(selectedIds?.ids ?? []);
    if (idArray.length === 0) {
      return false;
    }
    for (const id of idArray) {
      const row = rows.find((r) => r.id === id);
      if (!row || !row.surtidor) {
        return false;
      }
    }
    return true;
  };

  return (
    <Box>
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
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        density="compact"
        loading={loading}
        isRowSelectable={(params) => !(params.row.surtidor && params.row.empacador)}
        onRowClick={(params) => {
          const id = params.row.id; 
          navigate(`/venta/${id}`); // Redirige a la pantalla de detalle
        }}
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

        <Button
          variant="contained"
          color="success"
          startIcon={<GroupAddIcon />}
          disabled={assigning || !canAssignEmpacador()}
          onClick={handleOpenEmpacadorModal}
        >
          Seleccionar Empacador
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
      <Dialog open={openEmpacadorModal} onClose={() => setOpenEmpacadorModal(false)}>
      <DialogTitle>Selecciona Empacador</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id="empacador-label">Empacador</InputLabel>
          <Select
            labelId="empacador-label"
            value={selectedEmpacador}
            label="Empacador"
            onChange={(e) => setSelectedEmpacador(e.target.value)}
          >
            {empacadores.map((emp) => (
              <MenuItem key={emp.id_empacador} value={emp.id_empacador}>
                {`${emp.empacador_nombre} - ${emp.empacador_correo}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <Dialog
      open={openEmpacadorModal}
      onClose={() => setOpenEmpacadorModal(false)}
      fullWidth
      maxWidth="xs"
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <DialogTitle>Selecciona Empacador</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="empacador-label">Empacador</InputLabel>
            <Select
              labelId="empacador-label"
              value={selectedEmpacador}
              label="Empacador"
              onChange={(e) => setSelectedEmpacador(e.target.value)}
            >
              {empacadores.map((emp) => (
                <MenuItem key={emp.id_empacador} value={emp.id_empacador}>
                  {`${emp.empacador_nombre} - ${emp.empacador_correo}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmpacadorModal(false)}>
            Cerrar
          </Button>
          <Button
            onClick={handleAsignarEmpacador}
            variant="contained"
            color="primary"
            disabled={!selectedEmpacador || assigning}
          >
            {assigning ? 'Asignando...' : 'Asignar Empacador'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>

    </Dialog>
    </Box>
  );
}

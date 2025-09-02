import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { useEmpacadoresActivos } from '../../components/useEmpacadores';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Button, Snackbar, Alert
} from '@mui/material';
import clienteAxios from '../../src/context/Config';
import { Link } from 'react-router-dom';

export const columns = [
  {
    field: 'publicaciones_titulopublicacion',
    headerName: 'Título de la publicación',
    flex: 2,
    minWidth: 200,
  },
  {
    field: 'ventas_noventa',
    headerName: 'No Venta',
    flex: 0.5,
    minWidth: 160,
    renderCell: (params) => {
      const noventa = params.value;
      const origen = params.row?.origen;
      const id = params.row?.id;
      let color = 'default';
      let textColor = '#000';
      let bgColor = '#e0e0e0';
  
      switch (origen.toUpperCase()) {
        case 'MERCADO LIBRE':
          color = 'warning';
          bgColor = '#f8f32b '; 
          textColor = '#856404';
          break;
        default:
          bgColor = '#f8f9fa';
          textColor = '#6c757d';
          break;
      }  
      return (
        <Link
          to={`/venta/${id}`}
          style={{
            textDecoration: 'none',
            backgroundColor: bgColor,
            color: textColor,
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '8px',
            textAlign: 'center',
            width: '100%',
            display: 'inline-block'
          }}
          onClick={(e) => e.stopPropagation()} 
        >
          {noventa}
        </Link>
        );
      },
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
    minWidth: 200,
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
    renderCell: (params) => <EmpacadorCell row={params.row} />
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
      const hasEtiqueta = Boolean(params.value);
      if (!hasEtiqueta) return '';
  
      const fileName = `etiqueta_${params.row?.ventas_noventa ?? 'documento'}.pdf`;
  
      const onClick = async (e) => {
        e.stopPropagation();
        try {
          const noVenta = params.row?.ventas_noventa;
          if (!noVenta) return;
  
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
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
        }
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
    field: 'publicaciones_sku',
    headerName: 'SKU',
    flex: 1,
    minWidth: 100,
  }
];


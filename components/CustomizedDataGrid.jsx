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
import DataGridWeb from './DataGridWeb';
import DataGridMobile from './DataGridMobile';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function CustomizedDataGrid() {
  // ----- Responsive -----
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <>
      {!isMobile && <DataGridWeb />}
      {isMobile && <DataGridMobile />}
    </>
  );
}

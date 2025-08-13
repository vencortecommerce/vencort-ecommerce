import * as React from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

export default function MainGridSale() {
  const [formData, setFormData] = React.useState({
    plataforma: '',
    numeroPedido: '',
    fechaVenta: '',
    estadoPedido: '',
    precioVenta: '',
    fechaEntrega: '',
    nombreCliente: '',
    tituloProducto: '',
    varianteColor: '',
    unidades: '',
    costoComision: '',
    costoEnvio: '',
    imagenUrl: '',
    estadoRepublica: '',
    codigoPostal: '',
    telefono: '',
    direccion: '',
  });

  const [productos, setProductos] = React.useState([
    { precioUnitario: '', skuOriginal: '', skuVencort: '', skuPlataforma: '' },
  ]);

  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductoChange = (index, field, value) => {
    const updated = [...productos];
    updated[index][field] = value;
    setProductos(updated);
  };

  const handleAgregarProducto = () => {
    setProductos((prev) => [
      ...prev,
      { precioUnitario: '', skuOriginal: '', skuVencort: '', skuPlataforma: '' },
    ]);
  };

  const handleEliminarProducto = (index) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = { ...formData, productos };
      console.log('Datos enviados:', payload); // Aquí puedes reemplazar por clienteAxios.post(...)
      setSuccessMessage('Venta registrada exitosamente');

      // Limpiar campos
      setFormData({
        plataforma: '',
        numeroPedido: '',
        fechaVenta: '',
        estadoPedido: '',
        precioVenta: '',
        fechaEntrega: '',
        nombreCliente: '',
        tituloProducto: '',
        varianteColor: '',
        unidades: '',
        costoComision: '',
        costoEnvio: '',
        imagenUrl: '',
        estadoRepublica: '',
        codigoPostal: '',
        telefono: '',
        direccion: '',
      });
      setProductos([
        { precioUnitario: '', skuOriginal: '', skuVencort: '', skuPlataforma: '' },
      ]);
    } catch (err) {
      setError('Error al registrar venta.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => setSuccessMessage('');

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ '& .MuiTextField-root': { m: 1, width: '40ch' }, p: 2 }}
      autoComplete="off"
    >
      <Typography variant="h6" sx={{ mb: 2 }}>Registrar nueva venta</Typography>

      <div>
        <TextField required label="Plataforma" name="plataforma" value={formData.plataforma} onChange={handleChange} />
        <TextField required label="Número de pedido" name="numeroPedido" value={formData.numeroPedido} onChange={handleChange} />
      </div>
      <div>
        <TextField required type="date" label="Fecha de venta" name="fechaVenta" InputLabelProps={{ shrink: true }} value={formData.fechaVenta} onChange={handleChange} />
        <TextField required label="Estado del pedido" name="estadoPedido" value={formData.estadoPedido} onChange={handleChange} />
      </div>
      <div>
        <TextField required type="number" label="Precio de venta" name="precioVenta" value={formData.precioVenta} onChange={handleChange} />
        <TextField required type="date" label="Fecha de entrega" name="fechaEntrega" InputLabelProps={{ shrink: true }} value={formData.fechaEntrega} onChange={handleChange} />
      </div>
      <div>
        <TextField required label="Nombre del cliente" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} />
        <TextField required label="Título del producto" name="tituloProducto" value={formData.tituloProducto} onChange={handleChange} />
      </div>
      <div>
        <TextField label="Variante de color/diseño" name="varianteColor" value={formData.varianteColor} onChange={handleChange} />
        <TextField required type="number" label="Unidades" name="unidades" value={formData.unidades} onChange={handleChange} />
      </div>
      <div>
        <TextField required type="number" label="Costo comisión" name="costoComision" value={formData.costoComision} onChange={handleChange} />
        <TextField required type="number" label="Costo envío" name="costoEnvio" value={formData.costoEnvio} onChange={handleChange} />
      </div>
      <div>
        <TextField label="Imagen URL" name="imagenUrl" value={formData.imagenUrl} onChange={handleChange} />
        <TextField required label="Estado de la república" name="estadoRepublica" value={formData.estadoRepublica} onChange={handleChange} />
      </div>
      <div>
        <TextField required label="Código postal" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} />
        <TextField required label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
      </div>
      <div>
        <TextField required label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} sx={{ width: '82ch' }} />
      </div>

      {/* Sección dinámica de productos */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Productos
      </Typography>

      {productos.map((producto, index) => (
        <Box key={index} sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2 }}>
          <div>
            <TextField
              required
              label="Precio unitario"
              name="precioUnitario"
              type="number"
              value={producto.precioUnitario}
              onChange={(e) => handleProductoChange(index, 'precioUnitario', e.target.value)}
            />
            <TextField
              required
              label="SKU Original"
              name="skuOriginal"
              value={producto.skuOriginal}
              onChange={(e) => handleProductoChange(index, 'skuOriginal', e.target.value)}
            />
          </div>
          <div>
            <TextField
              required
              label="SKU Vencort"
              name="skuVencort"
              value={producto.skuVencort}
              onChange={(e) => handleProductoChange(index, 'skuVencort', e.target.value)}
            />
            <TextField
              required
              label="SKU Plataforma"
              name="skuPlataforma"
              value={producto.skuPlataforma}
              onChange={(e) => handleProductoChange(index, 'skuPlataforma', e.target.value)}
            />
          </div>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <IconButton
              onClick={() => handleEliminarProducto(index)}
              color="error"
              disabled={productos.length === 1}
            >
              <RemoveCircleIcon />
            </IconButton>
            {index === productos.length - 1 && (
              <IconButton onClick={handleAgregarProducto} color="primary">
                <AddCircleIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}

      <Box sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrar venta'}
        </Button>
      </Box>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Box, Typography, CircularProgress, Alert, CssBaseline, Stack,
  Button, Divider, Paper, Grid, Dialog, DialogTitle, DialogContent, Tooltip, IconButton
} from '@mui/material';
import clienteAxios from '../src/context/Config';
import AppNavbar from './AppNavbar';
import SideMenu from './SideMenu';
import AppTheme from '../theme/AppTheme';
import Seccion from '../internals/components/Seccion';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function MainGridSaleDetail(props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detalle, setDetalle] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [zoomedImage, setZoomedImage] = React.useState(null);

  React.useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await clienteAxios.get(`/api/ventas/detalle?idmercadolibre=${id}`, config);
        setDetalle(response.data);
      } catch (err) {
        setError('No se pudo cargar el detalle de la venta.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [id]);

  const handleDescargarEtiqueta = () => {
    if (!detalle?.etiqueta) return;
    const byteCharacters = atob(detalle.etiqueta);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Etiqueta_${detalle.ventas_noventa}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) return null;

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu selectedPage={''} setSelectedPage={() => {}} />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack spacing={2} sx={{ alignItems: 'center', mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, mx: 'auto' }}>

              {loading ? (
                <CircularProgress />
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography component="h2" variant="h6">
                      Detalle de Venta - No {detalle.ventas_noventa}
                    </Typography>
                    {detalle.etiqueta && (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleDescargarEtiqueta}
                      >
                        Descargar Etiqueta
                      </Button>
                    )}
                  </Box>

                  <Seccion titulo="Información General" contenido={{
                    Origen: detalle.origen,
                    TipoPublicación: detalle.publicaciones_tipopublicacion,
                    Variante: detalle.publicaciones_variante,
                    Publicidad: detalle.publicidad_ventapublicidad,
                    Empacador: detalle.empacador,
                    Surtidor: detalle.surtidor,
                    EstadoVenta: detalle.estadoVenta,
                    Noventa: detalle.ventas_noventa,
                    Anulaciones: detalle.ventas_anulacionesreembolsos,
                    CargoVenta: detalle.ventas_cargoventa,
                    CostosDeEnvío: detalle.ventas_costosenvio,
                    IngresosEnvio: detalle.ventas_ingresosenvio,
                    IngresosProducto: detalle.ventas_ingresosproducto,
                    Total: detalle.ventas_totalmxn,
                    Unidades: detalle.ventas_unidades,
                    FechaVenta: detalle.ventas_fechaventa,
                    DescripcionEstado: detalle.ventas_descripcionestado,
                    PaqueteVarios: detalle.ventas_paquetevarios
                  }} />

                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Productos en esta venta:
                  </Typography>
                  {detalle.detalle?.length > 0 ? (
                    detalle.detalle.map((item, idx) => (
                      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }} key={idx}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                          {item.publicaciones_titulopublicacion}
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                          {item.imagen && (
                            <Grid item xs={12} md={2}>
                              <Box sx={{ position: 'relative', width: 90, height: 90 }}>
                                <Box
                                  component="img"
                                  src={`data:image/jpeg;base64,${item.imagen}`}
                                  alt="Imagen del producto"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    borderRadius: 2,
                                    border: '1px solid #ccc',
                                    backgroundColor: '#f9f9f9',
                                  }}
                                />
                                <Tooltip title="Ver imagen completa">
                                  <IconButton
                                    onClick={() => setZoomedImage(item.imagen)}
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      bottom: 4,
                                      right: 4,
                                      backgroundColor: 'white',
                                      borderRadius: '50%',
                                      boxShadow: 1
                                    }}
                                  >
                                    <ZoomInIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Grid>
                          )}
                          <Grid item xs>
                            <Grid container spacing={1}>
                              <Grid item xs={6} md={3}>
                                <Typography><strong>SKU:</strong> {item.publicaciones_sku}</Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography><strong>Tipo:</strong> {item.publicaciones_type}</Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography><strong>Unidades:</strong> {item.publicaciones_unidad}</Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography><strong>Precio Unitario:</strong> ${item.publicaciones_preciounitario}</Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography><strong>Precio Total:</strong> ${item.publicaciones_preciototal}</Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))
                  ) : (
                    <Typography>No hay productos disponibles</Typography>
                  )}

                  <Seccion titulo="Comprador" contenido={{
                    Comprador: detalle.compradores_comprador,
                    Domicilio: detalle.compradores_domicilio,
                    Municipio: detalle.compradores_municipioalcaldia,
                    Estado: detalle.compradores_estado,
                    País: detalle.compradores_pais,
                    IFE: detalle.compradores_ife,
                    CP: detalle.compradores_codigopostal
                  }} />

                  <Seccion titulo="Envío" contenido={{
                    FormaEntrega: detalle.envios_formaentrega,
                    Transportista: detalle.envios_transportista,
                    NúmeroSeguimiento: detalle.envios_numeroseguimiento,
                    FechaEnCamino: detalle.envios_fechaencamino,
                    FechaEntregado: detalle.envios_fechaentregado,
                    UrlSeguimiento: detalle.envios_urlseguimiento
                  }} />

                  <Seccion titulo="Facturación" contenido={{
                    CFDI: detalle.facturacion_cfdi,
                    TipoContribuyente: detalle.facturacion_tipocontribuyente,
                    RégimenFiscal: detalle.facturacion_regimenfiscal,
                    Dirección: detalle.facturacion_direccion,
                    TipoUsuario: detalle.facturacion_tipousuario,
                    DatosEmpresa: detalle.facturacion_datospersonalesempresa,
                    FacturaAdjunta: detalle.facturacion_facturaadjunta,
                    TipoNumDocumento: detalle.facturacion_tiponumerodocumento
                  }} />

                  <Seccion titulo="Reclamos" contenido={{
                    R: detalle.reclamos_reclamoabierto,
                    ReclamoCerrado: detalle.reclamos_reclamocerrado,
                    ConMediación: detalle.reclamos_conmediacion,
                    Unidades: detalle.reclamos_unidades
                  }} />

                  <Seccion titulo="Devoluciones" contenido={{
                    FormaEntrega: detalle.devoluciones_formaentrega,
                    Transportista: detalle.devoluciones_transportista,
                    NúmeroSeguimiento: detalle.devoluciones_numeroseguimiento,
                    FechaEnCamino: detalle.devoluciones_fechaencamino,
                    FechaEntregado: detalle.devoluciones_fechaentregado,
                    UrlSeguimiento: detalle.devoluciones_urlseguimiento,
                    Unidades: detalle.devoluciones_unidades
                  }} />
                </>
              )}
              <Box mt={2}>
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                  Volver al listado de Ventas
                </Button>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Dialog open={!!zoomedImage} onClose={() => setZoomedImage(null)} maxWidth="md">
        <DialogTitle>Imagen del producto</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={`data:image/jpeg;base64,${zoomedImage}`}
            alt="Imagen zoom"
            sx={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
    </AppTheme>
  );
}

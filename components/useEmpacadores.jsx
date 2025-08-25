import { useEffect, useState } from 'react';
import clienteAxios from '../src/context/Config';

export const useEmpacadoresActivos = () => {
  const [empacadores, setEmpacadores] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) {
      const fetch = async () => {
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
          setLoaded(true);
        } catch (e) {
          console.error('Error cargando empacadores:', e);
        }
      };
      fetch();
    }
  }, [loaded]);

  return empacadores;
};

import { useEffect, useState } from 'react';
import clienteAxios from '../src/context/Config';

export const useEmpacadoresActivos = () => {
  const [empacadores, setEmpacadores] = useState([]);

  useEffect(() => {
    const cached = localStorage.getItem('empacadoresCache');

    if (cached) {
      setEmpacadores(JSON.parse(cached));
      return;
    }

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

        localStorage.setItem('empacadoresCache', JSON.stringify(activos));
        setEmpacadores(activos);
      } catch (e) {
        console.error('Error cargando empacadores:', e);
      }
    };

    fetch();
  }, []);

  return empacadores;
};

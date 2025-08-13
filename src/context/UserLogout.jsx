import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import clienteAxios from './Config'; // Ajusta la ruta según tu proyecto

export function useLogout() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      if (user?.token) {
        await clienteAxios.post(
          '/api/usuarios/cierreSesion',
          {}, // cuerpo vacío porque el POST no envía datos
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    }
  };

  return logout;
}

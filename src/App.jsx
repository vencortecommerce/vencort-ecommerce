import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './SignIn.jsx';
import Dashboard from './Dashboard.jsx';
import { UserProvider } from './context/UserContext';
import MainGridSaleDetail from '../components/MainGridSaleDetail';

function App() {
  return ( <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/formulario-venta" element={<Dashboard initialPage="Formularío Venta" />} />
          <Route path="/estadisticas" element={<Dashboard initialPage="Estadísticas" />} />
          <Route path="/registro-usuario" element={<Dashboard initialPage="Registro de Usuario" />} />
          <Route path="/registro-empacadores" element={<Dashboard initialPage="Registro de Empacadores" />} />
          <Route path="/alertas" element={<Dashboard initialPage="Alertas" />} />
          <Route path="/venta/:id" element={<MainGridSaleDetail />} />
        </Routes>
      </Router></UserProvider>
  );
}

export default App;

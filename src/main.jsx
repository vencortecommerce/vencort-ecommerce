import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // <--- ESTE ES TU ARCHIVO DE RUTAS

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
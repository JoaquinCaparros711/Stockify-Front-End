import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap/dist/css/bootstrap.min.css';

// Layouts y Páginas
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Home from './components/pages/Home';
import Products from './components/pages/Products';
import './App.css'; 
import Movements from './components/pages/Movement';
import Stock from './components/pages/Stock';
import Branchs from './components/pages/Branchs';
import Users from './components/pages/Users';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <Router>
      {/* 2. <AuthProvider> está DENTRO del Router */}
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas Privadas */}
            <Route path="/*" element={<ProtectedRoute />}>
              {/* Estas son las rutas que estarán dentro del layout principal */}
              <Route index element={<Home />} /> {/* Usamos 'index' para la ruta raíz anidada */}
              <Route path="productos" element={<Products />} />
              <Route path="movimientos" element={<Movements />} />
              <Route path="stock" element={<Stock />} />
              <Route path="sucursales" element={<Branchs />} />
              <Route path="usuarios" element={<Users />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
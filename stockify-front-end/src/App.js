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

function App() {
  return (
    <Router>
      {/* 2. <AuthProvider> está DENTRO del Router */}
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Privadas */}
          <Route path="/*" element={<ProtectedRoute />}>
            {/* Estas son las rutas que estarán dentro del layout principal */}
            <Route index element={<Home />} /> {/* Usamos 'index' para la ruta raíz anidada */}
            <Route path="productos" element={<Products />} />
            {/* Añade aquí más rutas protegidas... */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// IMPORTANTE: Cambiamos la ruta de SideBar a la carpeta 'components'
import SideBar from './components/SideBar.jsx';
import NavBar from './components/NavBar.jsx';
import Home from './components/pages/Home.jsx';
import './App.css'; 
import Products from './components/pages/Products.jsx';

function App() {
  return (
    <Router>
      <div className="app-container">
        <SideBar />
        <div className="main-content">
          <main className="content-area">
            <Routes>
              <Route path="/" element={<Home />} /> 
              <Route path="/productos" element={<Products />} /> 
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
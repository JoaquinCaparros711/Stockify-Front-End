import React, { useState } from 'react'; 
import { NavLink } from 'react-router-dom';
import { sidebarItems, logoutItem } from '../data/sidebarData.js';
import { useAuth } from '../context/AuthContext';
import { BsList, BsPersonCircle } from 'react-icons/bs'; 
import './SideBar.css';


const SideBar = () => {
  // 2. OBTENEMOS EL OBJETO 'user' COMPLETO, NO SOLO EL LOGOUT
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        <BsList />
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            Stockify
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {sidebarItems.map((item, index) => (
              <li key={index} onClick={() => setIsOpen(false)}>
                {item.type === 'heading' ? (
                  <span className="nav-heading">{item.text}</span>
                ) : (
                  <NavLink to={item.path} className="nav-link">
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.text}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* --- 3. SECCIÓN DEL FOOTER ACTUALIZADA --- */}
        <div className="sidebar-footer">
            {/* Contenedor para la info del usuario */}
            <div className="user-info">
                <BsPersonCircle className="user-icon" />
                {/* Mostramos el nombre del usuario del contexto. Si no hay, no muestra nada. */}
                <span className="user-name">{user ? user.name : 'Usuario'}</span>
            </div>
            {/* El enlace de logout ahora está separado */}
            <a href="#" onClick={logout} className="nav-link logout-link">
                <span className="nav-icon">{logoutItem.icon}</span>
                <span className="nav-text">{logoutItem.text}</span>
            </a>
        </div>
      </div>
      
      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}
    </>
  );
};

export default SideBar;
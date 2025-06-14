import React, { useState } from 'react'; 
import { NavLink } from 'react-router-dom';
import { sidebarItems, logoutItem } from '../data/sidebarData.js';
import { useAuth } from '../context/AuthContext';
import { BsList } from 'react-icons/bs'; 
import './SideBar.css';


const SideBar = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 4. Botón de hamburguesa que solo será visible en móviles */}
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        <BsList />
      </button>

      {/* 5. Añadimos una clase 'open' dinámicamente si el estado es true */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          Stockify
        </div>
        <nav className="sidebar-nav">
          <ul>
            {sidebarItems.map((item, index) => (
              item.type === 'heading' ? (
                <li key={index} className="nav-heading">{item.text}</li>
              ) : (
                <li key={index} onClick={() => setIsOpen(false)}>
                  <NavLink to={item.path} className="nav-link">
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.text}</span>
                  </NavLink>
                </li>
              )
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <a href="#" onClick={logout} className="nav-link">
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
import React from 'react';
import { NavLink } from 'react-router-dom';
import { sidebarItems, logoutItem } from '../data/sidebarData.js';
import './SideBar.css';

const SideBar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        Stockify
      </div>
      <nav className="sidebar-nav">
        <ul>
          {sidebarItems.map((item, index) => (
            item.type === 'heading' ? (
              <li key={index} className="nav-heading">{item.text}</li>
            ) : (
              <li key={index}>
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
        <a href="#logout" className="nav-link">
            <span className="nav-icon">{logoutItem.icon}</span>
            <span className="nav-text">{logoutItem.text}</span>
        </a>
      </div>
    </div>
  );
};

export default SideBar;
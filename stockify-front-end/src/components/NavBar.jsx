import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { SideBarData } from './SideBarData';
import './Navbar.css';
import { IconContext } from 'react-icons/lib';
import { FaUserCircle } from 'react-icons/fa';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const userMenuRef = useRef(null);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

    const handleLogout = () => {
        console.log("Cerrar sesión clickeado");
        setIsUserMenuOpen(false);
    };

    const handleProfile = () => {
        console.log("Perfil clickeado");
        setIsUserMenuOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }

        if (isUserMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserMenuOpen]);

    return (
        <>
            <IconContext.Provider value={{ color: '#ef9327', size: '24px' }}>
                <div className="navbar">
                    <Link to="#" className="menu-bars" onClick={toggleSidebar}>
                        <FaIcons.FaBars />
                    </Link>

                    <div className="user-menu-container" ref={userMenuRef}>
                        <FaUserCircle className="user-icon" onClick={toggleUserMenu} />
                        {isUserMenuOpen && (
                            <div className="dropdown-menu">
                                <Link to="/profile" className="dropdown-item" onClick={handleProfile}>
                                    Perfil
                                </Link>
                                <button className="dropdown-item" onClick={handleLogout}>
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <nav className={isOpen ? 'nav-menu active' : 'nav-menu'}>
                    <ul className="nav-menu-items">
                        <li className="navbar-toggle">
                            <Link to="#" className="menu-close" onClick={toggleSidebar}>
                                <AiIcons.AiOutlineClose />
                            </Link>
                        </li>
                        {SideBarData.map((item, index) => {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path} onClick={toggleSidebar}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </IconContext.Provider>
        </>
    );
};

export default NavBar;
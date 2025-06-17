import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { sidebarItems, logoutItem } from '../data/sidebarData.js';
import { useAuth } from '../context/AuthContext';
// 1. Importamos los componentes y los íconos necesarios
import { Dropdown, Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { BsList, BsPersonCircle, BsExclamationTriangleFill, BsPencilFill } from 'react-icons/bs'; 
import './SideBar.css';


const SideBar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Estados para controlar ambos modales
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Estado para el formulario de editar perfil
  const [profileData, setProfileData] = useState({ name: '', email: '', password: '', confirmPassword: ''});

  // Este efecto carga los datos del usuario actual en el formulario cuando se abre el modal
  useEffect(() => {
    if (user && showProfileModal) {
        setProfileData({
            name: user.name || '',
            email: user.email || '', // Asumiendo que tu objeto user tiene un email
            password: '',
            confirmPassword: ''
        });
    }
  }, [user, showProfileModal]);


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // --- Lógica para el modal de Logout ---
  const handleShowLogoutConfirm = () => setShowLogoutConfirm(true);
  const handleCloseLogoutConfirm = () => setShowLogoutConfirm(false);
  const handleConfirmLogout = () => {
    handleCloseLogoutConfirm();
    logout();
  };

  // --- Lógica para el nuevo modal de Editar Perfil ---
  const handleShowProfileModal = () => setShowProfileModal(true);
  const handleCloseProfileModal = () => setShowProfileModal(false);

  const handleProfileFormChange = (e) => {
    setProfileData({...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSaveChanges = () => {
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
        alert("Las nuevas contraseñas no coinciden.");
        return;
    }
    // En una aplicación real, aquí llamarías a tu API para actualizar el perfil
    console.log("Guardando perfil:", profileData);
    alert("Perfil actualizado (simulación). Los cambios se reflejarán al volver a iniciar sesión.");
    handleCloseProfileModal();
  };

  return (
    <>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        <BsList />
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">Stockify</div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {sidebarItems.map((item, index) => (
              <li key={index} onClick={() => isOpen && setIsOpen(false)}>
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
        
        {/* --- FOOTER REESTRUCTURADO COMO MENÚ DESPLEGABLE --- */}
        <div className="sidebar-footer">
            <Dropdown drop="up" className="w-100">
                <Dropdown.Toggle as="div" className="user-info-toggle">
                    <div className="user-info">
                        <BsPersonCircle className="user-icon" />
                        <span className="user-name">{user ? user.name : 'Usuario'}</span>
                    </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="w-100 dropdown-menu-dark">
                    <Dropdown.Item onClick={handleShowProfileModal}>
                        <BsPencilFill className="me-2" /> Editar Perfil
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleShowLogoutConfirm} className="text-danger">
                        {logoutItem.icon && <span className="nav-icon me-2">{logoutItem.icon}</span>}
                        {logoutItem.text}
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
      </div>
      
      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}

      {/* --- MODAL DE CONFIRMACIÓN DE LOGOUT (Existente) --- */}
      <Modal show={showLogoutConfirm} onHide={handleCloseLogoutConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title><BsExclamationTriangleFill className="text-warning me-2" />Confirmar Cierre de Sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro, <strong>{user ? user.name : ''}</strong>, que deseas cerrar sesión?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLogoutConfirm}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmLogout}>Cerrar Sesión</Button>
        </Modal.Footer>
      </Modal>

      {/* --- NUEVO MODAL PARA EDITAR PERFIL --- */}
      <Modal show={showProfileModal} onHide={handleCloseProfileModal} centered>
        <Modal.Header closeButton>
            <Modal.Title>Editar Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Nombre Completo</Form.Label>
                    <Form.Control type="text" name="name" value={profileData.name} onChange={handleProfileFormChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={profileData.email} onChange={handleProfileFormChange} />
                </Form.Group>
                <hr />
                <p className="text-muted small">Dejar los siguientes campos en blanco si no deseas cambiar la contraseña.</p>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Nueva Contraseña</Form.Label>
                            <Form.Control type="password" name="password" value={profileData.password} onChange={handleProfileFormChange} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirmar Contraseña</Form.Label>
                            <Form.Control type="password" name="confirmPassword" value={profileData.confirmPassword} onChange={handleProfileFormChange} />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseProfileModal}>Cancelar</Button>
            <Button variant="primary" onClick={handleProfileSaveChanges}>Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SideBar;

"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { sidebarItems, logoutItem } from "../data/sidebarData.js"
import { useAuth } from "../context/AuthContext"
import { Dropdown, Modal, Button, Form, Row, Col } from "react-bootstrap"
import { BsList, BsExclamationTriangleFill, BsPencilFill } from "react-icons/bs"
import "./SideBar.css"

const SideBar = () => {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user && showProfileModal) {
      setProfileData({
        name: user.name || user.username || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
      })
    }
  }, [user, showProfileModal])

  const getDisplayName = () => {
    if (!user) return "Usuario"
    return user.name || user.username || user.email || "Usuario"
  }
  
  const displayName = getDisplayName();

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleShowLogoutConfirm = () => setShowLogoutConfirm(true)
  const handleCloseLogoutConfirm = () => setShowLogoutConfirm(false)
  const handleConfirmLogout = () => {
    handleCloseLogoutConfirm()
    logout()
  }

  const handleShowProfileModal = () => setShowProfileModal(true)
  const handleCloseProfileModal = () => setShowProfileModal(false)

  const handleProfileFormChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handleProfileSaveChanges = () => {
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      alert("Las nuevas contraseñas no coinciden.")
      return
    }
    alert("Perfil actualizado (simulación). Los cambios se reflejarán al volver a iniciar sesión.")
    handleCloseProfileModal()
  }

  return (
    <>
      <button className="sidebar-toggle-btn-apple" onClick={toggleSidebar}>
        <BsList />
      </button>

      <div className={`sidebar-apple ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header-apple">
          <div className="sidebar-logo-apple">Stockify</div>
        </div>
        <nav className="sidebar-nav-apple">
          <ul>
            {sidebarItems.map((item, index) => (
              <li key={index} onClick={() => isOpen && setIsOpen(false)}>
                {item.type === "heading" ? (
                  <span className="nav-heading-apple">{item.text}</span>
                ) : (
                  <NavLink to={item.path} className="nav-link-apple">
                    <span className="nav-icon-apple">{item.icon}</span>
                    <span className="nav-text-apple">{item.text}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer-apple">
          <Dropdown drop="up" className="w-100">
            <Dropdown.Toggle as="div" className="user-profile-toggle">
              <div className="user-info-apple">
                {/* Cambio visual: Avatar dinámico en lugar de ícono */}
                <img 
                  src={`https://ui-avatars.com/api/?name=${displayName.replace(' ', '+')}&background=random&color=fff`} 
                  alt="Avatar" 
                  className="user-avatar-apple"
                />
                <span className="user-name-apple">{displayName}</span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-apple">
              <Dropdown.Item onClick={handleShowProfileModal}>
                <BsPencilFill className="me-2" /> Editar Perfil
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleShowLogoutConfirm} className="dropdown-item-danger">
                {logoutItem.icon && <span className="me-2">{logoutItem.icon}</span>}
                {logoutItem.text}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {isOpen && <div className="sidebar-backdrop-apple" onClick={toggleSidebar}></div>}

      <Modal show={showLogoutConfirm} onHide={handleCloseLogoutConfirm} centered dialogClassName="apple-modal-dark">
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-apple">
            <BsExclamationTriangleFill className="text-warning me-2" />
            Confirmar Cierre de Sesión
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro, <strong>{displayName}</strong>, que deseas cerrar sesión?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="apple-button-secondary" onClick={handleCloseLogoutConfirm}>
            Cancelar
          </Button>
          <Button variant="danger" className="apple-button-danger" onClick={handleConfirmLogout}>
            Cerrar Sesión
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProfileModal} onHide={handleCloseProfileModal} centered dialogClassName="apple-modal-dark">
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-apple">Editar Perfil</Modal.Title>
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
            <hr className="my-4" />
            <p className="text-muted small">
              Dejar los siguientes campos en blanco si no deseas cambiar la contraseña.
            </p>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={profileData.password}
                    onChange={handleProfileFormChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleProfileFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="apple-button-secondary" onClick={handleCloseProfileModal}>
            Cancelar
          </Button>
          <Button variant="primary" className="apple-button-primary" onClick={handleProfileSaveChanges}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SideBar
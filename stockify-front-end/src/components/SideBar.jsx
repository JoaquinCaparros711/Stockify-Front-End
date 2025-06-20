"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { sidebarItems, logoutItem } from "../data/sidebarData.js"
import { useAuth } from "../context/AuthContext"
import { Dropdown, Modal, Button, Form, Row, Col } from "react-bootstrap"
import { BsList, BsPersonCircle, BsExclamationTriangleFill, BsPencilFill } from "react-icons/bs"
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

  // Función para obtener el nombre a mostrar
  const getDisplayName = () => {
    if (!user) return "Usuario"

    // Prioridad: name > username > email > 'Usuario'
    return user.name || user.username || user.email || "Usuario"
  }

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
    console.log("Guardando perfil:", profileData)
    alert("Perfil actualizado (simulación). Los cambios se reflejarán al volver a iniciar sesión.")
    handleCloseProfileModal()
  }

  // Debug: mostrar en consola los datos del usuario
  useEffect(() => {
    console.log("Datos del usuario en sidebar:", user)
  }, [user])

  return (
    <>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        <BsList />
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">Stockify</div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {sidebarItems.map((item, index) => (
              <li key={index} onClick={() => isOpen && setIsOpen(false)}>
                {item.type === "heading" ? (
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

        <div className="sidebar-footer">
          <Dropdown drop="up" className="w-100">
            <Dropdown.Toggle as="div" className="user-info-toggle">
              <div className="user-info">
                <BsPersonCircle className="user-icon" />
                <span className="user-name">{getDisplayName()}</span>
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

      <Modal show={showLogoutConfirm} onHide={handleCloseLogoutConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <BsExclamationTriangleFill className="text-warning me-2" />
            Confirmar Cierre de Sesión
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro, <strong>{getDisplayName()}</strong>, que deseas cerrar sesión?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLogoutConfirm}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmLogout}>
            Cerrar Sesión
          </Button>
        </Modal.Footer>
      </Modal>

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
          <Button variant="secondary" onClick={handleCloseProfileModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleProfileSaveChanges}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SideBar

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Button, Card, Table, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { BsPlus, BsPencilFill, BsTrashFill, BsXCircleFill, BsCheckCircleFill, BsExclamationTriangleFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Users.css';

// --- Componentes de Notificación (sin cambios) ---
const AppleStyleAlert = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="apple-style-alert">
            <BsXCircleFill className="alert-icon" />
            <span>{message}</span>
            <button onClick={onClose} className="close-alert-btn">&times;</button>
        </div>
    );
};

const AppleStyleSuccessToast = ({ message, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => { onClose(); }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;
    return (
        <div className="apple-style-toast success">
            <BsCheckCircleFill className="toast-icon" />
            <span>{message}</span>
        </div>
    );
};

const Users = () => {
    // --- CONTEXTOS Y ESTADOS (sin cambios) ---
    const { users, branches, loading, addUserByAdmin, updateUser, deleteUser } = useData();
    const { user: loggedInUser } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '', role: 'employee', branch: '' });
    const [alertMessage, setAlertMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // --- EFECTOS (sin cambios) ---
    useEffect(() => {
        if (editingUser) {
            setFormData({ ...editingUser, branch: editingUser.branch || '', password: '', confirmPassword: '' });
        } else {
            setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '', role: 'employee', branch: '' });
        }
        setAlertMessage('');
    }, [editingUser, showModal]);

    // --- MANEJADORES DE EVENTOS (sin cambios) ---
    const handleCloseModal = () => { setShowModal(false); setEditingUser(null); };
    const handleShowAddModal = () => { setEditingUser(null); setShowModal(true); };
    const handleShowEditModal = (userToEdit) => { setEditingUser(userToEdit); setShowModal(true); };
    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (alertMessage) setAlertMessage('');
    };

    // --- 💡 FUNCIÓN MODIFICADA CON VALIDACIONES DETALLADAS ---
    const handleSaveChanges = async () => {
        const { name, username, email, password, confirmPassword, role, branch } = formData;
        
        // --- 1. Validaciones de Nombre ---
        const trimmedName = name.trim();
        if (!trimmedName) return setAlertMessage("El nombre completo es obligatorio.");
        if (/\d/.test(trimmedName)) return setAlertMessage("El nombre no debe contener números.");

        // --- 2. Validaciones de Username ---
        const trimmedUsername = username.trim();
        if (!trimmedUsername) return setAlertMessage("El nombre de usuario es obligatorio.");
        if (/^\d+$/.test(trimmedUsername)) return setAlertMessage("El nombre de usuario no puede consistir solo de números.");
        const isUsernameDuplicate = users.some(
            u => u.username.toLowerCase() === trimmedUsername.toLowerCase() && u.id !== (editingUser ? editingUser.id : null)
        );
        if (isUsernameDuplicate) return setAlertMessage("Ese nombre de usuario ya está en uso.");

        // --- 3. Validaciones de Email ---
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return setAlertMessage("El email es obligatorio.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return setAlertMessage("El formato del email es inválido.");
        const isEmailDuplicate = users.some(
            u => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.id !== (editingUser ? editingUser.id : null)
        );
        if (isEmailDuplicate) return setAlertMessage("Ese email ya está registrado.");

        // --- 4. Validaciones de Contraseña ---
        if (!editingUser || password) { // Validar solo si es un usuario nuevo o si se está cambiando la contraseña
            if (!password) return setAlertMessage("La contraseña es obligatoria para usuarios nuevos.");
            if (password.length < 8) return setAlertMessage("La contraseña debe tener al menos 8 caracteres.");
            if (!/[A-Z]/.test(password)) return setAlertMessage("La contraseña debe contener al menos una mayúscula.");
            if (!/\d/.test(password)) return setAlertMessage("La contraseña debe contener al menos un número.");
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return setAlertMessage("La contraseña debe contener al menos un símbolo.");
            if (password !== confirmPassword) return setAlertMessage("Las contraseñas no coinciden.");
        }

        // --- 5. Validación de Sucursal ---
        if (role === 'employee' && !branch) {
            return setAlertMessage("Debes asignar una sucursal al empleado.");
        }

        // Si todas las validaciones pasan
        try {
            if (editingUser) {
                const dataToUpdate = { ...formData };
                if (!dataToUpdate.password) { // No enviar contraseñas vacías
                    delete dataToUpdate.password;
                    delete dataToUpdate.confirmPassword;
                }
                await updateUser(editingUser.id, dataToUpdate);
                setSuccessMessage("¡Usuario actualizado con éxito!");
            } else {
                const payload = { ...formData, password2: formData.confirmPassword };
                await addUserByAdmin(payload);
                setSuccessMessage("¡Usuario creado con éxito!");
            }
            handleCloseModal();
        } catch (error) {
            const apiError = error.response?.data ? JSON.stringify(error.response.data) : "Ocurrió un error en el servidor.";
            setAlertMessage(apiError);
        }
    };
    
    // --- Lógica de borrado (sin cambios) ---
    const handleDeleteClick = (user) => { setUserToDelete(user); setShowDeleteConfirm(true); };
    const handleCloseDeleteConfirm = () => { setUserToDelete(null); setShowDeleteConfirm(false); };
    const handleConfirmDelete = async () => {
        if (userToDelete) {
            try {
                await deleteUser(userToDelete.id);
                setSuccessMessage("¡Usuario eliminado con éxito!");
            } catch (error) {
                alert("Hubo un error al eliminar el usuario.");
            } finally {
                handleCloseDeleteConfirm();
            }
        }
    };
    
    // --- El resto del componente no tiene cambios ---
    const displayUsers = useMemo(() => {
        if (loading || !users.length || !branches.length || !loggedInUser) { return []; }
        const enrichedUsers = users.map(user => {
            const branch = branches.find(b => b.id === user.branch);
            return { ...user, branchName: branch ? branch.name : 'N/A' };
        });
        if (loggedInUser.role === 'admin') { return enrichedUsers; }
        if (loggedInUser.role === 'employee') {
            const employeeBranch = loggedInUser.branch;
            return enrichedUsers.filter(user => user.role === 'admin' || (user.role === 'employee' && user.branch === employeeBranch));
        }
        return [];
    }, [users, branches, loading, loggedInUser]);

    const isAdmin = loggedInUser && loggedInUser.role === 'admin';

    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }

    return (
        <Container fluid className="users-container">
            <AppleStyleSuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />

            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Gestión de Usuarios</h1>
                    <p className="page-subtitle">Crea, edita y asigna roles a los usuarios de tu sistema.</p>
                </div>
                {isAdmin && (
                    <Button className="btn-add-user shadow-sm" onClick={handleShowAddModal}>
                        <BsPlus size={22} className="me-2" />
                        Agregar Usuario
                    </Button>
                )}
            </header>

            <Card className="shadow-sm users-table-card">
                <Table responsive className="users-table mb-0">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Username</th>
                            <th>Rol</th>
                            <th>Sucursal Asignada</th>
                            {isAdmin && <th className="text-end">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {displayUsers && displayUsers.length > 0 ? (
                            displayUsers.map((user) => (
                                <tr key={user.id ?? `user-fallback-${user.username}-${user.email}`}>
                                    <td data-label="Usuario">
                                        <div className="user-cell">
                                            <img src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`} alt={user.name} className="user-avatar" />
                                            <div className="user-cell-info">
                                                <div>{user.name}</div>
                                                <small className="text-muted">{user.email}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Username">{user.username}</td>
                                    <td data-label="Rol"><span className={`badge-role ${user.role === 'admin' ? 'badge-role-admin' : 'badge-role-employee'}`}>{user.role}</span></td>
                                    <td data-label="Sucursal Asignada">{user.branchName}</td>
                                    {isAdmin && (
                                        <td data-label="Acciones" className="text-end">
                                            <Button variant="light" size="sm" className="me-2 action-btn" onClick={() => handleShowEditModal(user)}><BsPencilFill /></Button>
                                            <Button variant="light" size="sm" className="action-btn action-btn-danger" onClick={() => handleDeleteClick(user)}><BsTrashFill /></Button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={isAdmin ? 5 : 4} className="text-center text-muted py-5">No hay usuarios para mostrar.</td></tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton><Modal.Title>{editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <AppleStyleAlert message={alertMessage} onClose={() => setAlertMessage('')} />
                    <Form>
                        <Form.Group className="mb-3"><Form.Label>Nombre Completo</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} /></Form.Group>
                        <Row>
                            <Col><Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" name="username" value={formData.username} onChange={handleFormChange} /></Form.Group></Col>
                            <Col><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={handleFormChange} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col><Form.Group className="mb-3"><Form.Label>Contraseña</Form.Label><Form.Control type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''} /></Form.Group></Col>
                            <Col><Form.Group className="mb-3"><Form.Label>Confirmar Contraseña</Form.Label><Form.Control type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleFormChange} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col><Form.Group className="mb-3"><Form.Label>Rol</Form.Label><Form.Select name="role" value={formData.role} onChange={handleFormChange}><option value="employee">Empleado</option><option value="admin">Admin</option></Form.Select></Form.Group></Col>
                            {formData.role === 'employee' && (
                                <Col><Form.Group className="mb-3"><Form.Label>Sucursal</Form.Label><Form.Select name="branch" value={formData.branch} onChange={handleFormChange}><option value="">Seleccionar sucursal...</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</Form.Select></Form.Group></Col>
                            )}
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSaveChanges}>Guardar Cambios</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteConfirm} onHide={handleCloseDeleteConfirm} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <BsExclamationTriangleFill className="text-danger me-2" />
                        Confirmar Eliminación
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que quieres eliminar al usuario <strong>"{userToDelete?.name}"</strong>? Esta acción no se puede deshacer.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteConfirm}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Users;
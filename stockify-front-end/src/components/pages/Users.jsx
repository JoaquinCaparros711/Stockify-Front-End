import React, { useState, useEffect, useMemo } from 'react';
import { Container, Button, Card, Table, Modal, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { BsPeopleFill, BsPlus, BsPencilFill, BsTrashFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Users.css';

const Users = () => {
    // 1. OBTENEMOS TODOS LOS DATOS Y FUNCIONES DE LOS CONTEXTOS
    const { users, branches, loading, addUserByAdmin, updateUser, deleteUser } = useData();
    const { user: loggedInUser } = useAuth();

    // Estados locales para el modal y el formulario
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '', role: 'employee', branch: '' });

    useEffect(() => {
        if (editingUser) {
            setFormData({ ...editingUser, branch: editingUser.branch || '', password: '', confirmPassword: '' });
        } else {
            setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '', role: 'employee', branch: '' });
        }
    }, [editingUser, showModal]);

    const handleCloseModal = () => { setShowModal(false); setEditingUser(null); };
    const handleShowAddModal = () => { setEditingUser(null); setShowModal(true); };
    const handleShowEditModal = (userToEdit) => { setEditingUser(userToEdit); setShowModal(true); };
    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSaveChanges = async () => {
        if (!formData.name || !formData.username || !formData.email) {
            alert("Nombre, Usuario y Email son obligatorios.");
            return;
        }
        if (!editingUser && !formData.password) {
            alert("La contraseña es obligatoria para nuevos usuarios.");
            return;
        }
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            if (editingUser) {
                const dataToUpdate = { ...formData };
                if (!dataToUpdate.password) {
                    delete dataToUpdate.password;
                    delete dataToUpdate.confirmPassword;
                }
                await updateUser(editingUser.id, dataToUpdate);
            } else {
                const payload = { ...formData, password2: formData.confirmPassword };
                await addUserByAdmin(payload);
            }
            handleCloseModal();
        } catch (error) {
            console.log("La API devolvió un error, el modal no se cerrará.");
        }
    };
    
    const handleDeleteUser = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            deleteUser(id);
        }
    };
    
    // --- 2. LÓGICA CLAVE PARA "ENRIQUECER" LOS DATOS DE USUARIOS ---
    const displayUsers = useMemo(() => {
        // Solo procesamos si no está cargando y si ambos arrays necesarios tienen datos
        if (loading || !users.length || !branches.length) {
            return [];
        }
        
        return users.map(user => {
            const branch = branches.find(b => b.id === user.branch);
            return {
                ...user,
                branchName: branch ? branch.name : 'N/A' // Creamos una nueva propiedad con el nombre
            };
        });
    }, [users, branches, loading]); // Dependencias del useMemo

    const isAdmin = loggedInUser && loggedInUser.role === 'admin';

    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }

    return (
        <Container fluid className="users-container">
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
                            // 3. LA TABLA AHORA USA LOS DATOS ENRIQUECIDOS
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
                                            <Button variant="light" size="sm" className="action-btn action-btn-danger" onClick={() => handleDeleteUser(user.id)}><BsTrashFill /></Button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={isAdmin ? 4 : 3} className="text-center text-muted py-5">No hay usuarios para mostrar.</td></tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton><Modal.Title>{editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3"><Form.Label>Nombre Completo</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} /></Form.Group>
                        <Row>
                            <Col><Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" name="username" value={formData.username} onChange={handleFormChange} /></Form.Group></Col>
                            <Col><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={handleFormChange} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col><Form.Group className="mb-3"><Form.Label>Contraseña</Form.Label><Form.Control type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''} /></Form.Group></Col>
                            {!editingUser && <Col><Form.Group className="mb-3"><Form.Label>Confirmar Contraseña</Form.Label><Form.Control type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleFormChange} /></Form.Group></Col>}
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
        </Container>
    );
};

export default Users;

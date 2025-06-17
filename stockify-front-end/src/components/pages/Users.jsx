import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { BsPlus, BsPencilFill, BsTrashFill } from 'react-icons/bs';
import './Users.css';

const mockUsers = [
    { id: 1, name: 'Joaquín (Admin)', username: 'joaco', email: 'joaco@test.com', role: 'admin', branchId: null },
    { id: 2, name: 'Carlos (Empleado)', username: 'vendedor1', email: 'carlos@test.com', role: 'employee', branchId: 2 },
    { id: 3, name: 'Ana (Empleada)', username: 'vendedora_mza', email: 'ana@test.com', role: 'employee', branchId: 3 },
];
const mockBranches = [{ id: 1, name: 'Depósito Central' }, { id: 2, name: 'Sucursal Córdoba' }, { id: 3, name: 'Sucursal Mendoza' }];

const Users = () => {
    const [users, setUsers] = useState(mockUsers);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '', role: 'employee', branchId: '' });

    useEffect(() => { if (editingUser) { setFormData({ ...editingUser, password: '', confirmPassword: '' }); } else { setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '', role: 'employee', branchId: '' }); } }, [editingUser]);
    const handleCloseModal = () => { setShowModal(false); setEditingUser(null); };
    const handleShowAddModal = () => { setEditingUser(null); setShowModal(true); };
    const handleShowEditModal = (user) => { setEditingUser(user); setShowModal(true); };
    const handleFormChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSaveChanges = () => {
        if (!editingUser && formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        if (editingUser) {
            console.log('Actualizando usuario:', formData);
            setUsers(users.map(u => (u.id === editingUser.id ? { ...formData, id: u.id } : u)));
        } else {
            console.log('Creando nuevo usuario:', formData);
            setUsers([...users, { ...formData, id: Date.now() }]);
        }
        handleCloseModal();
    };
    const handleDeleteUser = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            console.log('Eliminando usuario con id:', id);
            setUsers(users.filter(u => u.id !== id));
        }
    };
    const getBranchName = (branchId) => { if (!branchId) return 'N/A'; const branch = mockBranches.find(b => b.id === branchId); return branch ? branch.name : 'Desconocida'; };

    return (
        <Container fluid className="users-container">
            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Gestión de Usuarios</h1>
                    <p className="page-subtitle">Crea, edita y asigna roles a los usuarios de tu sistema.</p>
                </div>
                <Button className="btn-add-user shadow-sm" onClick={handleShowAddModal}>
                    <BsPlus size={22} className="me-2" />
                    Agregar Usuario
                </Button>
            </header>

            <Card className="shadow-sm users-table-card">
                <Table responsive className="users-table mb-0">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Sucursal Asignada</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td data-label="Usuario">
                                    <div className="user-cell">
                                        <img src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`} alt={user.name} className="user-avatar" />
                                        <div className="user-cell-info">
                                            <div>{user.name}</div>
                                            <small className="text-muted">{user.email}</small>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Rol"><span className={`badge-role ${user.role === 'admin' ? 'badge-role-admin' : 'badge-role-employee'}`}>{user.role}</span></td>
                                <td data-label="Sucursal">{getBranchName(user.branchId)}</td>
                                <td data-label="Acciones" className="text-end">
                                    <Button variant="light" size="sm" className="me-2 action-btn" onClick={() => handleShowEditModal(user)}><BsPencilFill /></Button>
                                    <Button variant="light" size="sm" className="action-btn action-btn-danger" onClick={() => handleDeleteUser(user.id)}><BsTrashFill /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            {/* --- CONTENIDO DEL MODAL REINSERTADO --- */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</Modal.Title>
                </Modal.Header>
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
                                <Col><Form.Group className="mb-3"><Form.Label>Sucursal</Form.Label><Form.Select name="branchId" value={formData.branchId} onChange={handleFormChange}><option value="">Seleccionar sucursal...</option>{mockBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</Form.Select></Form.Group></Col>
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
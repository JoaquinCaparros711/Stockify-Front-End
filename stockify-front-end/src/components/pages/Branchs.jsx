import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { BsBuilding, BsPlus, BsPencilFill, BsTrashFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Branchs.css';

const Sucursales = () => {
    const { branches, loading, addBranch, updateBranch, deleteBranch } = useData();
    const { user } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

    useEffect(() => {
        if (editingBranch) {
            setFormData(editingBranch);
        } else {
            setFormData({ name: '', address: '', phone: '' });
        }
    }, [editingBranch, showModal]);

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBranch(null);
    };

    const handleShowAddModal = () => {
        setEditingBranch(null);
        setShowModal(true);
    };

    const handleShowEditModal = (branch) => {
        setEditingBranch(branch);
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        if (!formData.name || !formData.address || !formData.phone) {
            alert("Por favor, completa todos los campos.");
            return;
        }
        try {
            if (editingBranch) {
                await updateBranch(editingBranch.id, formData);
            } else {
                await addBranch(formData);
            }
            handleCloseModal();
        } catch (error) {
            console.log("La API devolvió un error, el modal no se cerrará.");
        }
    };
    
    const handleDeleteBranch = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta sucursal?')) {
            deleteBranch(id);
        }
    };

    // --- COMPROBACIÓN DE ROL MÁS ROBUSTA ---
    // Verificamos que el usuario exista y convertimos su rol a minúsculas antes de comparar.
    const isAdmin = user && user.role && user.role.toLowerCase() === 'admin';

    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }

    return (
        <Container fluid className="branches-container">
            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Gestión de Sucursales</h1>
                    <p className="page-subtitle">Crea, edita y administra las ubicaciones de tu negocio.</p>
                </div>
                {/* Ahora usamos la variable 'isAdmin' para decidir si mostrar el botón */}
                {isAdmin && (
                    <Button className="btn-add-branch shadow-sm" onClick={handleShowAddModal}>
                        <BsPlus size={22} className="me-2" />
                        Agregar Sucursal
                    </Button>
                )}
            </header>

            <Card className="shadow-sm branches-table-card">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0">Lista de Sucursales</h5>
                </Card.Header>
                <Card.Body>
                    <Table responsive className="branches-table mb-0">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Dirección</th>
                                <th>Teléfono</th>
                                {isAdmin && <th className="text-end">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {branches && branches.length > 0 ? (
                                branches.map((branch) => (
                                    <tr key={branch.id}>
                                        <td data-label="Nombre" className="fw-bold">{branch.name}</td>
                                        <td data-label="Dirección">{branch.address}</td>
                                        <td data-label="Teléfono">{branch.phone}</td>
                                        {isAdmin && (
                                            <td data-label="Acciones" className="text-end">
                                                <Button variant="light" size="sm" className="me-2 action-btn" onClick={() => handleShowEditModal(branch)}>
                                                    <BsPencilFill />
                                                </Button>
                                                <Button variant="light" size="sm" className="action-btn action-btn-danger" onClick={() => handleDeleteBranch(branch.id)}>
                                                    <BsTrashFill />
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="text-center text-muted py-5">
                                        No hay sucursales para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton><Modal.Title>{editingBranch ? 'Editar Sucursal' : 'Agregar Nueva Sucursal'}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3"><Form.Label>Nombre de la Sucursal</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Ej: Depósito Principal" required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Dirección</Form.Label><Form.Control type="text" name="address" value={formData.address} onChange={handleFormChange} placeholder="Ej: Av. San Martín 123" required /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Teléfono</Form.Label><Form.Control type="text" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Ej: 2604409751" required /></Form.Group>
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

export default Sucursales;

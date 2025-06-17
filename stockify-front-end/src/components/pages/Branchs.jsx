import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Table, Modal, Form } from 'react-bootstrap';
import { BsPlus, BsPencilFill, BsTrashFill } from 'react-icons/bs';
import './Branchs.css'; // <-- CAMBIAMOS AL NUEVO ARCHIVO CSS

const mockBranches = [
    { id: 1, name: 'Depósito Central', address: 'Av. Siempre Viva 742', phone: '2604112233' },
    { id: 2, name: 'Sucursal Córdoba', address: 'Bv. Chacabuco 1100', phone: '3514998877' },
    { id: 3, name: 'Sucursal Mendoza', address: 'Av. San Martín 950', phone: '2614665544' },
];

const Sucursales = () => {
    const [branches, setBranches] = useState(mockBranches);
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

    useEffect(() => {
        if (editingBranch) {
            setFormData(editingBranch);
        } else {
            setFormData({ name: '', address: '', phone: '' });
        }
    }, [editingBranch]);

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

    const handleSaveChanges = () => {
        if (editingBranch) {
            console.log('Actualizando sucursal:', formData);
            setBranches(branches.map(b => (b.id === editingBranch.id ? { ...formData, id: b.id } : b)));
        } else {
            console.log('Creando nueva sucursal:', formData);
            setBranches([...branches, { ...formData, id: Date.now() }]);
        }
        handleCloseModal();
    };
    
    const handleDeleteBranch = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta sucursal?')) {
            console.log('Eliminando sucursal con id:', id);
            setBranches(branches.filter(b => b.id !== id));
        }
    };

    return (
        <Container fluid className="branches-container">
            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Gestión de Sucursales</h1>
                    <p className="page-subtitle">Crea, edita y administra las ubicaciones de tu negocio.</p>
                </div>
                <Button className="btn-add-branch shadow-sm" onClick={handleShowAddModal}>
                    <BsPlus size={22} className="me-2" />
                    Agregar Sucursal
                </Button>
            </header>

            <Card className="shadow-sm branches-table-card">
                <Table responsive className="branches-table mb-0">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Teléfono</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map((branch) => (
                            <tr key={branch.id}>
                                <td className="fw-bold">{branch.name}</td>
                                <td>{branch.address}</td>
                                <td>{branch.phone}</td>
                                <td className="text-end">
                                    <Button variant="light" size="sm" className="me-2 action-btn" onClick={() => handleShowEditModal(branch)}>
                                        <BsPencilFill />
                                    </Button>
                                    <Button variant="light" size="sm" className="action-btn action-btn-danger" onClick={() => handleDeleteBranch(branch.id)}>
                                        <BsTrashFill />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton><Modal.Title>{editingBranch ? 'Editar Sucursal' : 'Agregar Nueva Sucursal'}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3"><Form.Label>Nombre de la Sucursal</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Ej: Depósito Principal" /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Dirección</Form.Label><Form.Control type="text" name="address" value={formData.address} onChange={handleFormChange} placeholder="Ej: Av. San Martín 123" /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Teléfono</Form.Label><Form.Control type="text" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Ej: 2604123456" /></Form.Group>
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
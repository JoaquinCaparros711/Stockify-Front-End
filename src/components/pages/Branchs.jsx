import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { BsPlus, BsPencilFill, BsTrashFill, BsXCircleFill, BsCheckCircleFill, BsExclamationTriangleFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Branchs.css';

// --- Componentes de Notificación Estilo Apple ---
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

const Sucursales = () => {
    const { branches, loading, addBranch, updateBranch, deleteBranch } = useData();
    const { user } = useAuth();

    // Estados para los modales y formularios
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

    // Estados para notificaciones
    const [alertMessage, setAlertMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState(null);

    useEffect(() => {
        if (editingBranch) {
            setFormData(editingBranch);
        } else {
            setFormData({ name: '', address: '', phone: '' });
        }
        setAlertMessage(''); // Limpiar errores al abrir
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
        if (alertMessage) setAlertMessage(''); // Limpiar alerta al corregir
    };

    // --- FUNCIÓN MODIFICADA CON VALIDACIONES ---
    const handleSaveChanges = async () => {
        const { name, address, phone } = formData;
        
        // 1. Validar Nombre
        const trimmedName = name.trim();
        if (!trimmedName) return setAlertMessage("El nombre de la sucursal es obligatorio.");
        if (/^\d+$/.test(trimmedName)) return setAlertMessage("El nombre no puede consistir solo en números.");
        const isNameDuplicate = branches.some(
            b => b.name.toLowerCase() === trimmedName.toLowerCase() && b.id !== (editingBranch ? editingBranch.id : null)
        );
        if (isNameDuplicate) return setAlertMessage("Ya existe una sucursal con este nombre.");

        // 2. Validar Dirección
        if (!address.trim()) return setAlertMessage("La dirección es obligatoria.");
        if (/^\d+$/.test(address.trim())) return setAlertMessage("La dirección no puede consistir solo en números.");

        // 3. Validar Teléfono
        const trimmedPhone = phone.trim();
        if (!trimmedPhone) return setAlertMessage("El teléfono es obligatorio.");
        if (!/^\d+$/.test(trimmedPhone)) return setAlertMessage("El teléfono solo debe contener números.");
        if (trimmedPhone.length < 7) return setAlertMessage("El número de teléfono parece demasiado corto.");

        // Si todo es válido
        try {
            if (editingBranch) {
                await updateBranch(editingBranch.id, formData);
                setSuccessMessage("¡Sucursal actualizada con éxito!");
            } else {
                await addBranch(formData);
                setSuccessMessage("¡Sucursal creada con éxito!");
            }
            handleCloseModal();
        } catch (error) {
            const apiError = error.response?.data?.name?.[0] || 'Ocurrió un error en el servidor.';
            setAlertMessage(apiError);
        }
    };
    
    // --- NUEVAS FUNCIONES PARA EL MODAL DE BORRADO ---
    const handleDeleteClick = (branch) => {
        setBranchToDelete(branch);
        setShowDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setBranchToDelete(null);
        setShowDeleteConfirm(false);
    };

    const handleConfirmDelete = async () => {
        if (branchToDelete) {
            try {
                await deleteBranch(branchToDelete.id);
                setSuccessMessage("¡Sucursal eliminada con éxito!");
            } catch (error) {
                alert("Hubo un error al eliminar la sucursal.");
            } finally {
                handleCloseDeleteConfirm();
            }
        }
    };
    
    const isAdmin = user && user.role && user.role.toLowerCase() === 'admin';

    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }

    return (
        <Container fluid className="branches-container">
            <AppleStyleSuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />

            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Gestión de Sucursales</h1>
                    <p className="page-subtitle">Crea, edita y administra las ubicaciones de tu negocio.</p>
                </div>
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
                                                {/* MODIFICADO: Llama a la nueva función */}
                                                <Button variant="light" size="sm" className="action-btn action-btn-danger" onClick={() => handleDeleteClick(branch)}>
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
                    <AppleStyleAlert message={alertMessage} onClose={() => setAlertMessage('')} />
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

            {/* --- NUEVO MODAL DE CONFIRMACIÓN PARA ELIMINAR --- */}
            <Modal show={showDeleteConfirm} onHide={handleCloseDeleteConfirm} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <BsExclamationTriangleFill className="text-danger me-2" />
                        Confirmar Eliminación
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que quieres eliminar la sucursal <strong>"{branchToDelete?.name}"</strong>? Esta acción no se puede deshacer.
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

export default Sucursales;
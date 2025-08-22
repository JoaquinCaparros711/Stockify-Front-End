import React, { useState, useEffect, useMemo } from 'react';
import { Container, Button, Card, Table, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import { BsPencilSquare, BsPlus, BsXCircleFill, BsCheckCircleFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Stock.css'; 

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


const Stock = () => {
    // --- CONTEXTOS Y ESTADOS (sin cambios) ---
    const { branchStock, products, branches, loading, addBranchStock, adjustStock } = useData();
    const { user } = useAuth();
    
    const [selectedBranch, setSelectedBranch] = useState('');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [formData, setFormData] = useState({});
    const [alertMessage, setAlertMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- EFECTOS (sin cambios) ---
    useEffect(() => {
        if (branches.length > 0 && user) {
            let initialBranchName = '';
            if (user.role === 'admin') {
                initialBranchName = branches[0].name;
            } else if (user.role === 'employee') {
                const employeeBranch = branches.find(b => b.id === user.branch);
                if (employeeBranch) {
                    initialBranchName = employeeBranch.name;
                }
            }
            setSelectedBranch(initialBranchName);
        }
    }, [branches, user]);

    useEffect(() => {
        if (editingStock) {
            setFormData({ current_stock: editingStock.current_stock });
        } else {
            const currentBranchId = branches.find(b => b.name === selectedBranch)?.id || '';
            setFormData({ product: '', branch: currentBranchId, current_stock: '' });
        }
        setAlertMessage('');
    }, [editingStock, showAddModal, showAdjustModal, selectedBranch, branches]);

    // --- MANEJADORES DE EVENTOS ---
    const handleSelectBranch = (e) => setSelectedBranch(e.target.value);
    const handleShowAdjustModal = (stockItem) => { setEditingStock(stockItem); setShowAdjustModal(true); };
    const handleCloseAdjustModal = () => setShowAdjustModal(false);
    const handleShowAddModal = () => { setEditingStock(null); setShowAddModal(true); };
    const handleCloseAddModal = () => setShowAddModal(false);
    
    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (alertMessage) {
            setAlertMessage('');
        }
    };

    // --- FUNCIÓN DE AJUSTE MODIFICADA ---
    const handleAdjustStockSubmit = async () => {
        const newStock = parseInt(formData.current_stock);

        // Validación: el stock no puede ser negativo.
        if (isNaN(newStock) || newStock < 0) {
            setAlertMessage("La cantidad de stock no puede ser un número negativo.");
            return;
        }
        
        try {
            await adjustStock(editingStock.id, { current_stock: formData.current_stock });
            setSuccessMessage('¡Stock ajustado con éxito!');
            handleCloseAdjustModal();
        } catch (error) { 
            console.log("El ajuste de stock falló."); 
            setAlertMessage('Hubo un error al ajustar el stock.');
        }
    };

    const handleAddProductSubmit = async () => {
        const { product, branch, current_stock } = formData;
        if (!product) return setAlertMessage('Debes seleccionar un producto.');
        if (!branch) return setAlertMessage('Debes seleccionar una sucursal.');
        const quantity = parseInt(current_stock);
        if (isNaN(quantity) || quantity <= 0) {
            return setAlertMessage('La cantidad a ingresar debe ser un número mayor a cero.');
        }
        const productExistsInBranch = branchStock.some(
            item => item.product === product && item.branch === branch
        );
        if (productExistsInBranch) {
            return setAlertMessage('Este producto ya está registrado en la sucursal seleccionada.');
        }
        try {
            await addBranchStock(formData);
            setSuccessMessage('Producto ingresado al stock con éxito.');
            handleCloseAddModal();
        } catch (error) {
            const apiError = error.response?.data?.detail || 'Ocurrió un error en el servidor.';
            setAlertMessage(apiError);
        }
    };

    // --- DATOS MEMOIZADOS (sin cambios) ---
    const filteredStock = useMemo(() => {
        if (loading || !branchStock.length) return [];
        return branchStock
            .map(item => ({
                ...item,
                productName: products.find(p => p.id === item.product)?.name || 'N/A',
                category: products.find(p => p.id === item.product)?.category || 'N/A',
                branchName: branches.find(b => b.id === item.branch)?.name || 'N/A',
            }))
            .filter(item => item.branchName === selectedBranch);
    }, [branchStock, products, branches, selectedBranch, loading]);

    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }

    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <Container fluid className="stock-container">
            <AppleStyleSuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />

            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Gestión de Stock</h1>
                    <p className="page-subtitle">Visualiza y ajusta el inventario de cada sucursal.</p>
                </div>
                {user && user.role === 'admin' && (
                    <Button className="btn-add-stock shadow-sm" onClick={handleShowAddModal}>
                        <BsPlus size={22} className="me-2" />
                        Ingresar Producto
                    </Button>
                )}
            </header>

            <Card className="shadow-sm stock-table-card">
                <div className="stock-toolbar d-flex flex-wrap justify-content-between align-items-center">
                    <h5 className="mb-0">Inventario de: <strong>{selectedBranch}</strong></h5>
                    {user && user.role === 'admin' && (
                        <Form.Group controlId="branchSelect" className="mt-2 mt-md-0">
                            <Form.Select value={selectedBranch} onChange={handleSelectBranch}>
                                {branches.map(branch => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                    )}
                </div>
                
                <Table responsive className="stock-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th className="text-center">Stock Actual</th>
                            {user && user.role === 'admin' && <th className="text-end">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStock.length > 0 ? filteredStock.map((item) => (
                            <tr key={item.id}>
                                <td data-label="Producto" className="fw-bold">{item.productName}</td>
                                <td data-label="Categoría">{item.category}</td>
                                <td data-label="Stock Actual" className="text-center">
                                    <Badge bg={item.current_stock > 10 ? 'primary-light' : 'warning-light'} text={item.current_stock > 10 ? 'primary' : 'warning'} pill className="p-2 fs-6">{item.current_stock}</Badge>
                                </td>
                                {user && user.role === 'admin' && (
                                    <td data-label="Acciones" className="text-end">
                                        <Button variant="light" className="btn-adjust border" size="sm" onClick={() => handleShowAdjustModal(item)}>
                                            <BsPencilSquare className="me-1" /> Ajustar
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        )) : ( <tr><td colSpan={user && user.role === 'admin' ? 4 : 3} className="text-center text-muted py-5">No hay productos en esta sucursal.</td></tr> )}
                    </tbody>
                </Table>
            </Card>

            {/* --- MODAL DE AJUSTE MODIFICADO --- */}
            <Modal show={showAdjustModal} onHide={handleCloseAdjustModal} centered>
                <Modal.Header closeButton><Modal.Title>Ajustar Stock</Modal.Title></Modal.Header>
                <Modal.Body>
                    {/* Añadimos la alerta de error aquí */}
                    <AppleStyleAlert message={alertMessage} onClose={() => setAlertMessage('')} />
                    
                    <div className="adjust-stock-info">
                        <strong>Producto:</strong> {editingStock?.productName}<br/>
                        <strong>Stock Actual:</strong> {editingStock?.current_stock}
                    </div>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nueva Cantidad de Stock</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="current_stock" 
                                defaultValue={editingStock?.current_stock} 
                                onChange={handleFormChange} 
                                autoFocus 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAdjustModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleAdjustStockSubmit}>Guardar Ajuste</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
                <Modal.Header closeButton><Modal.Title>Ingresar Producto a Stock</Modal.Title></Modal.Header>
                <Modal.Body>
                    <AppleStyleAlert message={alertMessage} onClose={() => setAlertMessage('')} />
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Producto</Form.Label>
                            <Form.Select name="product" value={formData.product || ''} onChange={handleFormChange}>
                                <option value="">Selecciona un producto...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sucursal de Destino</Form.Label>
                            <Form.Select name="branch" value={formData.branch || ''} onChange={handleFormChange}>
                                <option value="">Selecciona una sucursal...</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Cantidad a Ingresar</Form.Label>
                            <Form.Control type="number" name="current_stock" value={formData.current_stock || ''} onChange={handleFormChange} placeholder="Ej: 50" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAddModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleAddProductSubmit}>Confirmar Ingreso</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Stock;
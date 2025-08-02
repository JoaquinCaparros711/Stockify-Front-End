import React, { useState, useEffect, useMemo } from 'react';
import { Container, Button, Card, Table, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { BsPencilSquare, BsPlus } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Stock.css'; 


const Stock = () => {
    // 1. OBTENEMOS DATOS Y FUNCIONES DE LOS CONTEXTOS
    const { branchStock, products, branches, loading, addBranchStock, adjustStock } = useData();
    const { user } = useAuth();
    
    // Estados locales para el filtro y los modales
    const [selectedBranch, setSelectedBranch] = useState('');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [formData, setFormData] = useState({});

    // Efecto para inicializar el selector de sucursal
    useEffect(() => {
        if (branches.length > 0) {
            // Si es admin, selecciona la primera. Si es empleado, la suya.
            const initialBranch = user.role === 'admin' ? branches[0].name : user.branch;
            setSelectedBranch(initialBranch);
        }
    }, [branches, user]);

    // Efecto para cargar los datos en el formulario
    useEffect(() => {
        if (editingStock) {
            setFormData({ current_stock: editingStock.current_stock, reason: '' });
        } else {
            setFormData({ product: '', branch: branches.find(b => b.name === selectedBranch)?.id || '', current_stock: '' });
        }
    }, [editingStock, showAddModal, showAdjustModal, selectedBranch, branches]);

    // --- LÓGICA PARA MANEJAR MODALES Y FORMULARIOS ---
    const handleSelectBranch = (e) => setSelectedBranch(e.target.value);
    const handleShowAdjustModal = (stockItem) => { setEditingStock(stockItem); setShowAdjustModal(true); };
    const handleCloseAdjustModal = () => setShowAdjustModal(false);
    const handleShowAddModal = () => { setEditingStock(null); setShowAddModal(true); };
    const handleCloseAddModal = () => setShowAddModal(false);
    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleAdjustStockSubmit = async () => {
        if (!formData.current_stock || formData.current_stock < 0) {
            alert("Por favor, ingresa una cantidad de stock válida.");
            return;
        }
        try {
            await adjustStock(editingStock.id, { current_stock: formData.current_stock });
            handleCloseAdjustModal();
        } catch (error) { console.log("El ajuste de stock falló."); }
    };

    const handleAddProductSubmit = async () => {
        if (!formData.product || !formData.branch || !formData.current_stock) {
            alert("Por favor, complete todos los campos.");
            return;
        }
        try {
            await addBranchStock(formData);
            handleCloseAddModal();
        } catch (error) { console.log("El ingreso de stock falló."); }
    };

    // Usamos useMemo para "enriquecer" y filtrar el stock
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

    return (
        <Container fluid className="stock-container">
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
                    <Form.Group controlId="branchSelect" className="mt-2 mt-md-0">
                        <Form.Select value={selectedBranch} onChange={handleSelectBranch} disabled={user.role !== 'admin'}>
                            {branches.map(branch => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
                        </Form.Select>
                    </Form.Group>
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

            {/* MODAL PARA AJUSTAR STOCK */}
            {editingStock && (
                <Modal show={showAdjustModal} onHide={handleCloseAdjustModal} centered>
                    <Modal.Header closeButton><Modal.Title>Ajustar Stock</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Alert variant="info">
                            <strong>Producto:</strong> {editingStock.productName}<br/>
                            <strong>Stock Actual:</strong> {editingStock.current_stock}
                        </Alert>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nueva Cantidad de Stock</Form.Label>
                                <Form.Control type="number" name="current_stock" defaultValue={editingStock.current_stock} onChange={handleFormChange} autoFocus />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseAdjustModal}>Cancelar</Button>
                        <Button variant="primary" onClick={handleAdjustStockSubmit}>Guardar Ajuste</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* MODAL PARA AÑADIR PRODUCTO A STOCK */}
            <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
                <Modal.Header closeButton><Modal.Title>Ingresar Producto a Stock</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Producto</Form.Label>
                            <Form.Select name="product" onChange={handleFormChange}>
                                <option>Selecciona un producto...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sucursal de Destino</Form.Label>
                            <Form.Select name="branch" defaultValue={branches.find(b => b.name === selectedBranch)?.id} onChange={handleFormChange} disabled={user.role !== 'admin'}>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Cantidad a Ingresar</Form.Label>
                            <Form.Control type="number" name="current_stock" onChange={handleFormChange} placeholder="Ej: 50" />
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

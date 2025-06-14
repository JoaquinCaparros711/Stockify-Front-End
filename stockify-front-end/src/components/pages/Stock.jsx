import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { BsPencilSquare, BsPlus } from 'react-icons/bs';
import './Stock.css'; 

const mockBranchStockData = [
    { id: 1, productId: 1, productName: 'Mate Imperial Calabaza', category: 'Mate', branchId: 1, branchName: 'Depósito Central', current_stock: 30 },
    { id: 2, productName: 'Mate camionero Algarrobo', category: 'Mate', branchId: 1, branchName: 'Depósito Central', current_stock: 8 },
    { id: 3, productName: 'Lata MATERO', category: 'Lata', branchId: 1, branchName: 'Depósito Central', current_stock: 15 },
    { id: 4, productName: 'Matera 100% cuero', category: 'Matera', branchId: 2, branchName: 'Sucursal Córdoba', current_stock: 5 },
];
const allProducts = [{id: 1, name: 'Mate Imperial Calabaza'}, {id: 2, name: 'Mate camionero Algarrobo'}, {id: 3, name: 'Matera 100% cuero'}, {id: 4, name: 'Lata MATERO'}];
const allBranches = [{id: 1, name: 'Depósito Central'}, {id: 2, name: 'Sucursal Córdoba'}, {id: 3, name: 'Sucursal Mendoza'}];

const Stock = () => {
    // --- ESTADOS DEL COMPONENTE ---
    const [branchStock, setBranchStock] = useState(mockBranchStockData); // Estado para la lista principal
    const [selectedBranch, setSelectedBranch] = useState('Depósito Central');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [formData, setFormData] = useState({}); // Estado para los datos del formulario

    // Efecto para cargar los datos en el formulario cuando se edita un stock
    useEffect(() => {
        if (editingStock) {
            setFormData({ newStock: editingStock.current_stock, reason: '' });
        } else {
            // Resetea el formulario para añadir un nuevo producto
            setFormData({ productId: '', branchId: selectedBranch, quantity: '' });
        }
    }, [editingStock, selectedBranch]);


    // --- LÓGICA PARA MANEJAR LOS MODALES Y FORMULARIOS ---
    const handleSelectBranch = (e) => setSelectedBranch(e.target.value);

    const handleShowAdjustModal = (stockItem) => {
        setEditingStock(stockItem);
        setShowAdjustModal(true);
    };
    const handleCloseAdjustModal = () => setShowAdjustModal(false);

    const handleShowAddModal = () => {
        setEditingStock(null); // Nos aseguramos de que no estamos en modo edición
        setShowAddModal(true);
    };
    const handleCloseAddModal = () => setShowAddModal(false);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdjustStock = () => {
        console.log(`Ajustando stock para ${editingStock.productName} a ${formData.newStock} por motivo: ${formData.reason}`);
        // Lógica para actualizar el estado
        setBranchStock(branchStock.map(item => 
            item.id === editingStock.id 
            ? { ...item, current_stock: parseInt(formData.newStock) } 
            : item
        ));
        handleCloseAdjustModal();
    };

    const handleAddProduct = () => {
        console.log("Ingresando nuevo producto al stock:", formData);
        const product = allProducts.find(p => p.id === parseInt(formData.productId));
        const branch = allBranches.find(b => b.id === parseInt(formData.branchId));
        
        const newStockEntry = {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            category: 'Nueva Cat.', // Esto vendría del producto real
            branchId: branch.id,
            branchName: branch.name,
            current_stock: parseInt(formData.quantity)
        };
        
        setBranchStock(prevStock => [newStockEntry, ...prevStock]);
        handleCloseAddModal();
    };


    const filteredStock = branchStock.filter(item => item.branchName === selectedBranch);

    return (
        <Container fluid className="stock-container">
            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Gestión de Stock</h1>
                    <p className="page-subtitle">Visualiza y ajusta el inventario de cada sucursal.</p>
                </div>
                <Button className="btn-add-stock shadow-sm" onClick={handleShowAddModal}>
                    <BsPlus size={22} className="me-2" />
                    Ingresar Producto
                </Button>
            </header>

            <Card className="shadow-sm stock-table-card">
                <div className="stock-toolbar d-flex flex-wrap justify-content-between align-items-center">
                    <h5 className="mb-0">Inventario de: <strong>{selectedBranch}</strong></h5>
                    <Form.Group controlId="branchSelect" className="mt-2 mt-md-0">
                        <Form.Select value={selectedBranch} onChange={handleSelectBranch}>
                            {allBranches.map(branch => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </div>
                
                <Table responsive className="stock-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th className="text-center">Stock Actual</th>
                            <th className="text-end">Acciones</th>
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
                                <td data-label="Acciones" className="text-end">
                                    <Button variant="light" className="btn-adjust border" size="sm" onClick={() => handleShowAdjustModal(item)}>
                                        <BsPencilSquare className="me-1" /> Ajustar
                                    </Button>
                                </td>
                            </tr>
                        )) : ( <tr><td colSpan="4" className="text-center text-muted py-5">No hay productos en esta sucursal.</td></tr> )}
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
                                <Form.Control type="number" name="newStock" defaultValue={editingStock.current_stock} onChange={handleFormChange} autoFocus />
                            </Form.Group>
                             <Form.Group className="mb-3">
                                <Form.Label>Motivo del Ajuste (Opcional)</Form.Label>
                                <Form.Control as="textarea" rows={3} name="reason" onChange={handleFormChange} placeholder="Ej: Conteo de inventario, producto dañado..." />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseAdjustModal}>Cancelar</Button>
                        <Button variant="primary" onClick={handleAdjustStock}>Guardar Ajuste</Button>
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
                            <Form.Select name="productId" onChange={handleFormChange}>
                                <option>Selecciona un producto...</option>
                                {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sucursal de Destino</Form.Label>
                            <Form.Select name="branchId" onChange={handleFormChange}>
                                <option>Selecciona sucursal...</option>
                                {allBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Cantidad a Ingresar</Form.Label>
                            <Form.Control type="number" name="quantity" onChange={handleFormChange} placeholder="Ej: 50" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAddModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleAddProduct}>Confirmar Ingreso</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Stock;
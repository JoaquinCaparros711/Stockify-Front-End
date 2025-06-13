import React, { useState } from 'react';
import { Container, Button, Card, Table, Badge, Form } from 'react-bootstrap';
import { BsPencilSquare, BsPlus } from 'react-icons/bs';
import './Stock.css'; 

const mockBranchStock = [
    { id: 1, productName: 'Mate Imperial Calabaza', category: 'Mate', branchName: 'Depósito Central', current_stock: 30 },
    { id: 2, productName: 'Mate camionero Algarrobo', category: 'Mate', branchName: 'Depósito Central', current_stock: 8 },
    { id: 3, productName: 'Lata MATERO', category: 'Lata', branchName: 'Depósito Central', current_stock: 15 },
    { id: 4, productName: 'Matera 100% cuero', category: 'Matera', branchName: 'Sucursal Córdoba', current_stock: 5 },
];
// const allProducts = [{id: 1, name: 'Mate Imperial Calabaza'}, {id: 2, name: 'Mate camionero Algarrobo'}];
const allBranches = [{id: 1, name: 'Depósito Central'}, {id: 2, name: 'Sucursal Córdoba'}, {id: 3, name: 'Sucursal Mendoza'}];

const Stock = () => {
    const [selectedBranch, setSelectedBranch] = useState('Depósito Central');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);

    // ... (tus funciones handle... se mantienen igual)

    const filteredStock = mockBranchStock.filter(item => item.branchName === selectedBranch);

    return (
        <Container fluid className="stock-container">
            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Gestión de Stock</h1>
                    <p className="page-subtitle">Visualiza y ajusta el inventario de cada sucursal.</p>
                </div>
                <Button className="btn-add-stock shadow-sm" onClick={() => setShowAddModal(true)}>
                    <BsPlus size={22} className="me-2" />
                    Ingresar Producto
                </Button>
            </header>

            <Card className="shadow-sm stock-table-card">
                <div className="stock-toolbar d-flex flex-wrap justify-content-between align-items-center">
                    <h5 className="mb-0">Inventario de: <strong>{selectedBranch}</strong></h5>
                    <Form.Group controlId="branchSelect" className="mt-2 mt-md-0">
                        <Form.Select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                            {allBranches.map(branch => <option key={branch.id}>{branch.name}</option>)}
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
                                <td className="fw-bold">{item.productName}</td>
                                <td>{item.category}</td>
                                <td className="text-center">
                                    <Badge bg={item.current_stock > 10 ? 'primary-light' : 'warning-light'} 
                                            text={item.current_stock > 10 ? 'primary' : 'warning'} 
                                            pill className="p-2 fs-6">
                                        {item.current_stock}
                                    </Badge>
                                </td>
                                <td className="text-end">
                                    <Button variant="light" className="btn-adjust border" size="sm" onClick={() => { setEditingStock(item); setShowAdjustModal(true); }}>
                                        <BsPencilSquare className="me-1" /> Ajustar
                                    </Button>
                                </td>
                            </tr>
                        )) : ( <tr><td colSpan="4" className="text-center text-muted py-5">No hay productos en esta sucursal.</td></tr> )}
                    </tbody>
                </Table>
            </Card>

            {/* ... (Tus dos modales, 'showAdjustModal' y 'showAddModal', se mantienen aquí sin cambios) ... */}

        </Container>
    );
};

export default Stock;
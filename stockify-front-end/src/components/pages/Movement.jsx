import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Dropdown, Table, Modal, Form } from 'react-bootstrap';
import { BsArrowDown, BsArrowUp, BsPlus } from 'react-icons/bs';
import './Movement.css';

const mockMovementsData = [
    { id: 1, date: '2025-06-12T10:30:00Z', type: 'incoming', productName: 'Mate Imperial Calabaza', quantity: 20, branchName: 'Depósito Central', userName: 'joaco', description: 'Ingreso de proveedor' },
    { id: 2, date: '2025-06-12T09:15:00Z', type: 'outgoing', productName: 'Matera 100% cuero', quantity: 2, branchName: 'Sucursal Córdoba', userName: 'vendedor1', description: 'Venta a cliente final' },
    { id: 3, date: '2025-06-11T15:00:00Z', type: 'outgoing', productName: 'Lata MATERO', quantity: 5, branchName: 'Sucursal Mendoza', userName: 'joaco', description: 'Transferencia a otra sucursal' },
];

// Datos de ejemplo para los selectores del formulario del modal
const allProducts = [{id: 1, name: 'Mate Imperial Calabaza'}, {id: 2, name: 'Matera 100% cuero'}, {id: 3, name: 'Lata MATERO'}];
const allBranches = [{id: 1, name: 'Depósito Central'}, {id: 2, name: 'Sucursal Córdoba'}, {id: 3, name: 'Sucursal Mendoza'}];

const Movements = () => {
    // ESTADOS PRINCIPALES
    const [movements, setMovements] = useState(mockMovementsData);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all'); // Estado para el filtro: 'all', 'incoming', 'outgoing'
    
    // Estado para el formulario del modal
    const [newMovementData, setNewMovementData] = useState({
        type: '',
        productId: '',
        branchId: '',
        quantity: '',
        description: ''
    });

    // --- LÓGICA DE MANEJO ---
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => {
        // Reseteamos el formulario cada vez que se abre el modal
        setNewMovementData({ type: '', productId: '', branchId: '', quantity: '', description: '' });
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewMovementData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = () => {
        if (!newMovementData.type || !newMovementData.productId || !newMovementData.branchId || !newMovementData.quantity) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        const newMovement = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: newMovementData.type,
            productName: allProducts.find(p => p.id === parseInt(newMovementData.productId))?.name || 'Desconocido',
            quantity: parseInt(newMovementData.quantity),
            branchName: allBranches.find(b => b.id === parseInt(newMovementData.branchId))?.name || 'Desconocida',
            userName: 'joaco', // Esto debería venir del contexto de Auth en una app real
            description: newMovementData.description,
        };

        // Añadimos el nuevo movimiento al principio de la lista
        setMovements(prevMovements => [newMovement, ...prevMovements]);
        
        console.log('Guardando nuevo movimiento:', newMovement);
        handleCloseModal();
    };

    // LÓGICA PARA FILTRAR LOS MOVIMIENTOS
    const filteredMovements = movements.filter(movement => {
        if (filter === 'all') return true;
        return movement.type === filter;
    });

    return (
        <Container fluid className="movements-container">
            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Movimientos de Stock</h1>
                    <p className="page-subtitle">Registra y visualiza todas las entradas y salidas de productos.</p>
                </div>
                <Button className="btn-movement shadow-sm" onClick={handleShowModal}>
                    <BsPlus size={22} className="me-2" />
                    Registrar Movimiento
                </Button>
            </header>

            <Card className="shadow-sm movements-table-card">
                <div className="movements-toolbar">
                    <Row className="align-items-center">
                        <Col xs={12} md={6}><h5 className="mb-0">Historial de Movimientos</h5></Col>
                        <Col xs={12} md={6} className="d-flex justify-content-end align-items-center">
                            {/* DROPDOWN DE FILTRO AHORA FUNCIONAL */}
                            <Dropdown onSelect={(eventKey) => setFilter(eventKey)}>
                                <Dropdown.Toggle variant="light" id="dropdown-type">
                                    Filtrar: {filter === 'all' ? 'Todos' : (filter === 'incoming' ? 'Entradas' : 'Salidas')}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey="all">Todos</Dropdown.Item>
                                    <Dropdown.Item eventKey="incoming">Entradas</Dropdown.Item>
                                    <Dropdown.Item eventKey="outgoing">Salidas</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </div>
                
                <Table responsive className="movements-table">
                    <thead>
                        <tr>
                            <th>Fecha y Hora</th>
                            <th>Tipo</th>
                            <th>Producto</th>
                            <th className="text-center">Cantidad</th>
                            <th>Sucursal</th>
                            <th>Usuario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* LA TABLA AHORA MUESTRA LOS DATOS FILTRADOS */}
                        {filteredMovements.map((movement) => (
                            <tr key={movement.id}>
                                <td>
                                    <div>{new Date(movement.date).toLocaleDateString()}</div>
                                    <small className="text-muted">{new Date(movement.date).toLocaleTimeString()}</small>
                                </td>
                                <td>
                                    <span className={movement.type === 'incoming' ? 'badge-in' : 'badge-out'}>
                                        {movement.type === 'incoming' ? <BsArrowDown className="me-2" /> : <BsArrowUp className="me-2" />}
                                        {movement.type === 'incoming' ? 'Entrada' : 'Salida'}
                                    </span>
                                </td>
                                <td>
                                    <div>{movement.productName}</div>
                                    <small className="text-muted">{movement.description}</small>
                                </td>
                                <td className="fw-bold text-center">{movement.quantity}</td>
                                <td>{movement.branchName}</td>
                                <td>{movement.userName}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton><Modal.Title>Registrar Nuevo Movimiento</Modal.Title></Modal.Header>
                <Modal.Body>
                    {/* FORMULARIO AHORA FUNCIONAL */}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de Movimiento</Form.Label>
                            <Form.Select name="type" value={newMovementData.type} onChange={handleFormChange}>
                                <option value="">Selecciona un tipo...</option>
                                <option value="incoming">Entrada</option>
                                <option value="outgoing">Salida</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Producto</Form.Label>
                            <Form.Select name="productId" value={newMovementData.productId} onChange={handleFormChange}>
                                <option value="">Selecciona un producto...</option>
                                {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sucursal</Form.Label>
                            <Form.Select name="branchId" value={newMovementData.branchId} onChange={handleFormChange}>
                                <option value="">Selecciona una sucursal...</option>
                                {allBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cantidad</Form.Label>
                            <Form.Control type="number" name="quantity" value={newMovementData.quantity} onChange={handleFormChange} placeholder="Ingresa la cantidad" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción (Opcional)</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" value={newMovementData.description} onChange={handleFormChange} placeholder="Ej: Venta a cliente, ingreso de proveedor..." />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSaveChanges}>Guardar Movimiento</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Movements;
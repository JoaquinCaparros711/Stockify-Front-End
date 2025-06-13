import React, {useState} from 'react';
import { Container, Row, Col, Button, Card, Dropdown, Table, Modal } from 'react-bootstrap';
import { BsArrowDown, BsArrowUp, BsPlus } from 'react-icons/bs';
import './Movement.css';

const mockMovements = [
    { id: 1, date: '2025-06-12T10:30:00Z', type: 'incoming', productName: 'Mate Imperial Calabaza', quantity: 20, branchName: 'Depósito Central', userName: 'joaco', description: 'Ingreso de proveedor' },
    { id: 2, date: '2025-06-12T09:15:00Z', type: 'outgoing', productName: 'Matera 100% cuero', quantity: 2, branchName: 'Sucursal Córdoba', userName: 'vendedor1', description: 'Venta a cliente final' },
    { id: 3, date: '2025-06-11T15:00:00Z', type: 'outgoing', productName: 'Lata MATERO', quantity: 5, branchName: 'Sucursal Mendoza', userName: 'joaco', description: 'Transferencia a otra sucursal' },
];

const Movements = () => {
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);
    const handleSaveChanges = () => {
        console.log('Guardando cambios...');
        handleCloseModal();
    };

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
                            <Dropdown>
                                <Dropdown.Toggle variant="light" id="dropdown-type">Filtrar por tipo</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item>Todos</Dropdown.Item>
                                    <Dropdown.Item>Entradas</Dropdown.Item>
                                    <Dropdown.Item>Salidas</Dropdown.Item>
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
                        {mockMovements.map((movement) => (
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

            {/* El Modal no necesita grandes cambios de estilo, Bootstrap se encarga */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton><Modal.Title>Registrar Nuevo Movimiento</Modal.Title></Modal.Header>
                <Modal.Body>{/* ... (tu formulario aquí) ... */}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSaveChanges}>Guardar Movimiento</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Movements;
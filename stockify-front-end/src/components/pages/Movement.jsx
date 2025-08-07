import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Button, Card, Dropdown, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { BsArrowDown, BsArrowUp, BsPlus } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Movement.css';

const Movements = () => {
    // 1. OBTENEMOS TODOS LOS DATOS Y FUNCIONES DE LOS CONTEXTOS
    const { movements, addMovement, products, branches, users, loading } = useData();
    const { user } = useAuth();

    // Estados locales para el filtro y el modal
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [newMovementData, setNewMovementData] = useState({
        movement_type: '',
        product: '',
        branch: '',
        quantity: '',
        description: ''
    });

    // Lógica para manejar el modal y el formulario
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => {
        setNewMovementData({ movement_type: '', product: '', branch: '', quantity: '', description: '' });
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        setNewMovementData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveChanges = async () => {
        if (!newMovementData.movement_type || !newMovementData.product || !newMovementData.branch || !newMovementData.quantity) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }
        try {
            await addMovement({ ...newMovementData, user: user.id });
            handleCloseModal();
        } catch (error) {
            console.log("El formulario no se cerrará debido a un error de la API.");
        }
    };

    // 2. "ENRIQUECEMOS" LOS DATOS DE MOVIMIENTOS ANTES DE MOSTRARLOS
    // Usamos useMemo para optimizar y que este cálculo no se rehaga innecesariamente.
    const displayMovements = useMemo(() => {
        // Si la API ya nos da los nombres, el "enriquecimiento" es mucho más sencillo.
        // Solo necesitamos parsear la fecha.
        if (loading || !Array.isArray(movements)) return [];

        return movements.map(mov => {
            // Corrección de la fecha
            let validDate = null;
            if (mov.date) {
                try {
                    const isoString = mov.date.replace(' ', 'T').split('.')[0];
                    const parsed = new Date(isoString);
                    if (!isNaN(parsed.getTime())) {
                        validDate = parsed;
                    }
                } catch (e) {
                    console.error("Fecha inválida al parsear:", mov.date);
                }
            }

            return {
                ...mov,
                // Los nombres ya vienen en el objeto 'mov' desde la API
                productName: mov.product_name || 'N/A',
                branchName: mov.branch_name || 'N/A',
                userName: mov.user_name || 'N/A',
                parsedDate: validDate
            };
        });
        // Ya no dependemos de products, branches, o users para el cálculo
    }, [movements, loading]);

    // La lógica de filtrado ahora opera sobre los datos enriquecidos
    const filteredMovements = displayMovements.filter(mov => filter === 'all' || mov.movement_type === filter);
    console.log("Movimientos filtrados:", filteredMovements);
    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }

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
                        {filteredMovements.map((movement) => (
                            <tr key={movement.id}>
                                <td data-label="Fecha y Hora">
                                    {movement.parsedDate ? (
                                        <>
                                            <div>{movement.parsedDate.toLocaleDateString()}</div>
                                            <small className="text-muted">{movement.parsedDate.toLocaleTimeString()}</small>
                                        </>
                                    ) : (
                                        <span>Fecha inválida</span>
                                    )}
                                </td>
                                <td data-label="Tipo">
                                    <span className={movement.movement_type === 'incoming' ? 'badge-in' : 'badge-out'}>
                                        {movement.movement_type === 'incoming' ? <BsArrowDown className="me-2" /> : <BsArrowUp className="me-2" />}
                                        {movement.movement_type === 'incoming' ? 'Entrada' : 'Salida'}
                                    </span>
                                </td>
                                <td data-label="Producto">
                                    <div>{movement.productName}</div>
                                    <small className="text-muted">{movement.description}</small>
                                </td>
                                <td data-label="Cantidad" className="fw-bold text-center">{movement.quantity}</td>
                                <td data-label="Sucursal">{movement.branchName}</td>
                                <td data-label="Usuario">{movement.userName}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton><Modal.Title>Registrar Nuevo Movimiento</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de Movimiento</Form.Label>
                            <Form.Select name="movement_type" value={newMovementData.movement_type} onChange={handleFormChange}>
                                <option value="">Selecciona un tipo...</option>
                                <option value="incoming">Entrada</option>
                                <option value="outgoing">Salida</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Producto</Form.Label>
                            <Form.Select name="product" value={newMovementData.product} onChange={handleFormChange}>
                                <option value="">Selecciona un producto...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sucursal</Form.Label>
                            <Form.Select name="branch" value={newMovementData.branch} onChange={handleFormChange}>
                                <option value="">Selecciona una sucursal...</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cantidad</Form.Label>
                            <Form.Control type="number" name="quantity" value={newMovementData.quantity} onChange={handleFormChange} placeholder="Ingresa la cantidad" min="1" />
                        </Form.Group>
                        <Form.Group>
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

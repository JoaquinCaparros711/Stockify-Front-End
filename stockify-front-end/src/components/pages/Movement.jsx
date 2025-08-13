import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Dropdown, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { BsArrowDown, BsArrowUp, BsPlus, BsXCircleFill, BsCheckCircleFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Movement.css';

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
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
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


const Movements = () => {
    const { movements, addMovement, products, branches, branchStock, loading } = useData();
    const { user } = useAuth();

    const isEmployee = user.role === 'employee';

    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [newMovementData, setNewMovementData] = useState({
        movement_type: '',
        product: '',
        branch: '',
        quantity: '',
        description: ''
    });

    // --- NUEVOS ESTADOS PARA NOTIFICACIONES ---
    const [alertMessage, setAlertMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleCloseModal = () => {
        setShowModal(false);
        setAlertMessage(''); // Limpiar alerta al cerrar
    };
    
    const handleShowModal = () => {
        let initialBranchId = '';
        if (user && user.role === 'employee') {
            initialBranchId = user.branch; 
        }
        setNewMovementData({
            movement_type: '',
            product: '',
            branch: initialBranchId,
            quantity: '',
            description: ''
        });
        setAlertMessage(''); // Limpiar alerta al abrir
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        setNewMovementData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (alertMessage) {
            setAlertMessage(''); // Limpiar alerta al empezar a corregir
        }
    };

    // --- FUNCIÓN MODIFICADA CON VALIDACIONES ---
    const handleSaveChanges = async () => {
        const { movement_type, product, branch, quantity } = newMovementData;

        // 1. Validar Tipo de Movimiento
        if (!movement_type) {
            return setAlertMessage('Debes seleccionar un tipo de movimiento.');
        }
        // 2. Validar Producto
        if (!product) {
            return setAlertMessage('Debes seleccionar un producto.');
        }
        // 3. Validar Sucursal
        if (!branch) {
            return setAlertMessage('Debes seleccionar una sucursal.');
        }
        // 4. Validar Cantidad
        const numQuantity = parseInt(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            return setAlertMessage('La cantidad debe ser un número mayor a cero.');
        }

        // Si todo es válido, procedemos
        try {
            await addMovement({ ...newMovementData, user: user.id });
            setSuccessMessage('¡Movimiento registrado con éxito!');
            handleCloseModal();
        } catch (error) {
            const apiError = error.response?.data?.detail || 'Ocurrió un error en el servidor.';
            setAlertMessage(apiError);
        }
    };
    
    // El resto de la lógica (useMemo, etc.) no cambia...
    const availableProducts = useMemo(() => {
        if (!isEmployee) { return products; }
        const employeeBranchId = user.branch;
        const movementType = newMovementData.movement_type;
        if (!employeeBranchId || !movementType) { return []; }
        if (movementType === 'incoming') { return products; }
        if (movementType === 'outgoing') {
            const productIdsInBranch = new Set(
                branchStock
                    .filter(stock => stock.branch === employeeBranchId && stock.current_stock > 0)
                    .map(stock => stock.product)
            );
            return products.filter(p => productIdsInBranch.has(p.id));
        }
        return [];
    }, [isEmployee, products, branchStock, user, newMovementData.movement_type]);

    const displayMovements = useMemo(() => {
        if (loading || !Array.isArray(movements)) return [];
        return movements.map(mov => {
            let validDate = null;
            if (mov.date) {
                try {
                    const isoString = mov.date.replace(' ', 'T').split('.')[0];
                    const parsed = new Date(isoString);
                    if (!isNaN(parsed.getTime())) { validDate = parsed; }
                } catch (e) { console.error("Fecha inválida al parsear:", mov.date); }
            }
            return {
                ...mov,
                productName: mov.product_name || 'N/A',
                branchName: mov.branch_name || 'N/A',
                userName: mov.user_name || 'N/A',
                parsedDate: validDate
            };
        });
    }, [movements, loading]);

    const filteredMovements = displayMovements.filter(mov => filter === 'all' || mov.movement_type === filter);
    
    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }


    return (
        <Container fluid className="movements-container">
            {/* --- AQUÍ SE RENDERIZA EL TOAST DE ÉXITO --- */}
            <AppleStyleSuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />

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
                                    ) : ( <span>Fecha inválida</span> )}
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
                    {/* --- AQUÍ SE RENDERIZA LA ALERTA DE ERROR --- */}
                    <AppleStyleAlert message={alertMessage} onClose={() => setAlertMessage('')} />

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
                            <Form.Select name="product" value={newMovementData.product} onChange={handleFormChange} disabled={!newMovementData.movement_type && isEmployee}>
                                <option value="">
                                    {!newMovementData.movement_type && isEmployee ? "Selecciona un tipo primero" : "Selecciona un producto..."}
                                </option>
                                {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sucursal</Form.Label>
                            <Form.Select name="branch" value={newMovementData.branch} onChange={handleFormChange} disabled={isEmployee}>
                                <option value="">Selecciona una sucursal...</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cantidad</Form.Label>
                            <Form.Control type="number" name="quantity" value={newMovementData.quantity} onChange={handleFormChange} placeholder="Ingresa la cantidad" />
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
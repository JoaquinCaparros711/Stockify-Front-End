import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Dropdown, Table, Modal, Form, Spinner, Pagination } from 'react-bootstrap';
import { BsArrowDown, BsArrowUp, BsPlus, BsXCircleFill, BsCheckCircleFill, BsCalendarEvent } from 'react-icons/bs';
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
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    
    // --- Estados para la Paginación ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [newMovementData, setNewMovementData] = useState({
        movement_type: '',
        product: '',
        branch: '',
        quantity: '',
        description: ''
    });

    const [alertMessage, setAlertMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleCloseModal = () => {
        setShowModal(false);
        setAlertMessage('');
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
        setAlertMessage('');
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        setNewMovementData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (alertMessage) {
            setAlertMessage('');
        }
    };

    const handleSaveChanges = async () => {
        const { movement_type, product, branch, quantity } = newMovementData;
        if (!movement_type) return setAlertMessage('Debes seleccionar un tipo de movimiento.');
        if (!product) return setAlertMessage('Debes seleccionar un producto.');
        if (!branch) return setAlertMessage('Debes seleccionar una sucursal.');
        const numQuantity = parseInt(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            return setAlertMessage('La cantidad debe ser un número mayor a cero.');
        }
        try {
            await addMovement({ ...newMovementData, user: user.id });
            setSuccessMessage('¡Movimiento registrado con éxito!');
            handleCloseModal();
        } catch (error) {
            const apiError = error.response?.data?.detail || 'Ocurrió un error en el servidor.';
            setAlertMessage(apiError);
        }
    };
    
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
            // --- Corrección de Fecha para evitar desfasaje por UTC ---
            let validDate = null;
            if (mov.date) {
                const dateString = mov.date.split('.')[0].replace(' ', 'T');
                const date = new Date(dateString);
                
                // Si la fecha es válida, la usamos. Esto maneja la fecha local correctamente.
                if (!isNaN(date.getTime())) {
                    validDate = date;
                }
            }
            return {
                ...mov,
                productName: mov.product_name || 'N/A',
                branchName: mov.branch_name || 'N/A',
                userName: mov.user_name || 'N/A',
                parsedDate: validDate
            };
        }).sort((a, b) => (b.parsedDate || 0) - (a.parsedDate || 0)); // Ordenar por fecha más reciente
    }, [movements, loading]);

    const filteredMovements = useMemo(() => {
        setCurrentPage(1); // Reiniciar a la página 1 cada vez que cambian los filtros
        return displayMovements.filter(mov => {
            const typeMatch = typeFilter === 'all' || mov.movement_type === typeFilter;
            
            // Ajuste en la comparación de fechas para ser más robusto
            const dateMatch = !dateFilter || (mov.parsedDate && mov.parsedDate.toLocaleDateString('sv-SE') === dateFilter);

            return typeMatch && dateMatch;
        });
    }, [displayMovements, typeFilter, dateFilter]);

    // Lógica para calcular la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMovements.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
    
    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }


    return (
        <Container fluid className="movements-container">
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
                    <Row className="align-items-center g-2">
                        <Col xs={12} md="auto"><h5 className="mb-0">Historial de Movimientos</h5></Col>
                        <Col xs={12} md>
                            <div className="d-flex justify-content-md-end align-items-center gap-2 flex-wrap">
                                <div className="date-filter-wrapper">
                                    <BsCalendarEvent className="date-filter-icon" />
                                    <Form.Control 
                                        type="date" 
                                        value={dateFilter} 
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    />
                                    {dateFilter && (
                                        <button className="clear-date-btn" onClick={() => setDateFilter('')}>&times;</button>
                                    )}
                                </div>

                                <Dropdown onSelect={(eventKey) => setTypeFilter(eventKey)}>
                                    <Dropdown.Toggle variant="light" id="dropdown-type">
                                        Filtrar: {typeFilter === 'all' ? 'Todos' : (typeFilter === 'incoming' ? 'Entradas' : 'Salidas')}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item eventKey="all">Todos</Dropdown.Item>
                                        <Dropdown.Item eventKey="incoming">Entradas</Dropdown.Item>
                                        <Dropdown.Item eventKey="outgoing">Salidas</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
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
                        {currentItems.map((movement) => (
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
                                <td data-label="Sucursal">{movement.branch_name}</td>
                                <td data-label="Usuario">{movement.user_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {totalPages > 1 && (
                    <div className="d-flex justify-content-center p-3">
                        <Pagination>
                            <Pagination.Prev 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={currentPage === 1}
                            />
                            <Pagination.Item active>{`Página ${currentPage} de ${totalPages}`}</Pagination.Item>
                            <Pagination.Next 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                disabled={currentPage === totalPages}
                            />
                        </Pagination>
                    </div>
                )}
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton><Modal.Title>Registrar Nuevo Movimiento</Modal.Title></Modal.Header>
                <Modal.Body>
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
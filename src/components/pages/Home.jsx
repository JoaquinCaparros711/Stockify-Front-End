import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import Select from 'react-select'; // Importamos react-select
import { 
    BsBoxSeam, BsCashCoin, BsPeople, BsArrowDownCircle, BsPlus, 
    BsXCircleFill, BsCheckCircleFill, BsTrophyFill, BsAwardFill, 
    BsArrowLeftCircleFill, BsArrowRightCircleFill 
} from 'react-icons/bs';
import VentasChart from '../../components/VentasChart';
import MovimientosChart from '../../components/MovementChart';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const KpiCard = ({ title, value, icon, color }) => (
    <div className="kpi-card shadow-sm">
        <div className={`kpi-icon-wrapper text-${color}`}>{icon}</div>
        <div>
            <h6 className="kpi-title">{title}</h6>
            <h3 className="kpi-value">{value}</h3>
        </div>
    </div>
);

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


const Home = () => {
    const { products, branchStock, movements, branches, users, loading, addMovement } = useData();
    const { user } = useAuth();

    const [showSaleModal, setShowSaleModal] = useState(false);
    const [saleData, setSaleData] = useState({ product: '', quantity: 1, branch: '', description: '' });

    const [alertMessage, setAlertMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [lowStockPage, setLowStockPage] = useState(0);
    const ITEMS_PER_PAGE = 5;

    const handleShowSaleModal = () => {
        let initialBranchId = '';
        if (user && user.role === 'employee') {
            initialBranchId = user.branch;
        } else if (branches && branches.length > 0) {
            initialBranchId = branches[0].id;
        }
        setSaleData({ product: '', quantity: 1, branch: initialBranchId, description: '' });
        setAlertMessage('');
        setShowSaleModal(true);
    };

    const handleCloseSaleModal = () => {
        setShowSaleModal(false);
        setAlertMessage('');
    };

    const handleSaleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'branch') {
            setSaleData({ ...saleData, branch: value, product: '' });
        } else {
            setSaleData({ ...saleData, [name]: value });
        }
        if (alertMessage) {
            setAlertMessage('');
        }
    };
    
    // Nuevo handler específico para react-select
    const handleProductSelect = (selectedOption) => {
        setSaleData(prev => ({...prev, product: selectedOption ? selectedOption.value : ''}));
    };


    const handleCreateSale = async () => {
        if (!saleData.product) {
            setAlertMessage("Por favor, selecciona un producto.");
            return;
        }
        const quantity = parseInt(saleData.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            setAlertMessage("La cantidad debe ser un número mayor a cero.");
            return;
        }

        const productId = parseInt(saleData.product);
        const branchId = parseInt(saleData.branch);

        const productInStock = branchStock.find(
            item => item.product === productId && item.branch === branchId
        );

        if (!productInStock || quantity > productInStock.current_stock) {
            const availableStock = productInStock ? productInStock.current_stock : 0;
            setAlertMessage(`Stock insuficiente. Solo hay ${availableStock} unidades disponibles.`);
            return;
        }

        try {
            await addMovement({
                movement_type: 'outgoing',
                product: productId,
                branch: branchId,
                quantity: quantity,
                description: saleData.description || `Venta desde Dashboard`,
                user: user.id
            });
            setSuccessMessage('¡Venta registrada con éxito!');
            handleCloseSaleModal();
        } catch(error) {
            const apiErrorMessage = error.response?.data?.detail || "Ocurrió un error en el servidor.";
            setAlertMessage(apiErrorMessage);
        }
    };

    const dashboardData = useMemo(() => {
        const initialData = { 
            totalProducts: 0, lowStockCount: 0, monthlySales: 0, totalUsersInScope: 0, lowStockProducts: [],
            bestSeller: 'Sin datos', topBranch: 'Sin datos'
        };

        if (loading || !products.length || !branchStock.length || !movements.length || !users.length || !user || !branches.length) {
            return initialData;
        }

        const lowStockItems = branchStock.filter(p => p.current_stock <= 10)
            .map(stockItem => {
                const productDetails = products.find(p => p.id === stockItem.product);
                const branchDetails = branches.find(b => b.id === stockItem.branch);
                return { 
                    ...stockItem, 
                    productName: productDetails?.name || 'N/A',
                    branchName: branchDetails?.name || 'N/A'
                };
            });

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlySalesMovements = movements.filter(m => {
            const movementDate = new Date(m.date);
            return m.movement_type === 'outgoing' &&
                movementDate.getMonth() === currentMonth &&
                movementDate.getFullYear() === currentYear;
        });

        const salesValue = monthlySalesMovements.reduce((sum, mov) => {
            const price = parseFloat(mov.price_at_movement) || 0;
            return sum + (price * mov.quantity);
        }, 0);

        let totalUsersInScope = 0;
        if (user.role === 'admin') {
            totalUsersInScope = users.length;
        } else if (user.role === 'employee') {
            const usersInScope = users.filter(u => u.role === 'admin' || u.branch === user.branch);
            totalUsersInScope = usersInScope.length;
        }

        let bestSeller = 'Sin ventas este mes';
        let topBranch = 'Sin ventas este mes';

        if (user.role === 'admin' && monthlySalesMovements.length > 0) {
            const salesByProduct = new Map();
            monthlySalesMovements.forEach(mov => {
                const currentQty = salesByProduct.get(mov.product_name) || 0;
                salesByProduct.set(mov.product_name, currentQty + mov.quantity);
            });
            if (salesByProduct.size > 0) {
                bestSeller = [...salesByProduct.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
            }

            const salesByBranch = new Map();
            monthlySalesMovements.forEach(mov => {
                const price = parseFloat(mov.price_at_movement) || 0;
                const saleValue = price * mov.quantity;
                const currentTotal = salesByBranch.get(mov.branch_name) || 0;
                salesByBranch.set(mov.branch_name, currentTotal + saleValue);
            });
            if (salesByBranch.size > 0) {
                topBranch = [...salesByBranch.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
            }
        }

        return {
            totalProducts: products.length,
            lowStockCount: lowStockItems.length,
            monthlySales: salesValue,
            totalUsersInScope: totalUsersInScope,
            lowStockProducts: lowStockItems,
            bestSeller,
            topBranch,
        };
    }, [products, branchStock, movements, users, branches, loading, user]);

    // Preparamos las opciones para react-select
    const productOptions = useMemo(() => {
        if (!saleData.branch) return [];
        
        const stockInSelectedBranch = branchStock.filter(
            item => item.branch === parseInt(saleData.branch) && item.current_stock > 0
        );
        const availableProductIds = new Set(stockInSelectedBranch.map(item => item.product));
        
        return products
            .filter(p => availableProductIds.has(p.id))
            .map(p => ({ value: p.id, label: p.name }));

    }, [saleData.branch, branchStock, products]);

    const formatCurrency = (number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number);

    const totalLowStockPages = Math.ceil(dashboardData.lowStockProducts.length / ITEMS_PER_PAGE);
    const paginatedLowStockProducts = dashboardData.lowStockProducts.slice(
        lowStockPage * ITEMS_PER_PAGE,
        (lowStockPage + 1) * ITEMS_PER_PAGE
    );

    const handleNextPage = () => {
        setLowStockPage(prev => Math.min(prev + 1, totalLowStockPages - 1));
    };

    const handlePrevPage = () => {
        setLowStockPage(prev => Math.max(prev - 1, 0));
    };


    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }


    return (
        <Container fluid>
            <AppleStyleSuccessToast 
                message={successMessage} 
                onClose={() => setSuccessMessage('')} 
            />

            <header className="d-flex align-items-center justify-content-between dashboard-header">
                <div>
                    <h1 className="dashboard-title">¡Hola, {user ? user.name : 'Usuario'}!</h1>
                    <p className="dashboard-subtitle">Un resumen de la actividad de tu negocio.</p>
                </div>
                <Button className="btn-create-sale" onClick={handleShowSaleModal}>
                    <BsPlus size={22} className="me-2" />
                    Crear Venta
                </Button>
            </header>

            <Row>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Total de Productos" value={dashboardData.totalProducts} icon={<BsBoxSeam size={32} />} color="primary" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Ventas del Mes" value={formatCurrency(dashboardData.monthlySales)} icon={<BsCashCoin size={32} />} color="success" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Productos con Bajo Stock" value={dashboardData.lowStockCount} icon={<BsArrowDownCircle size={32} />} color="warning" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title={user.role === 'admin' ? "Total de Usuarios" : "Equipo de la Sucursal"} value={dashboardData.totalUsersInScope} icon={<BsPeople size={32} />} color="info" /></Col>
            </Row>
            
            {user.role === 'admin' && (
                <Row>
                    <Col md={6} lg={6} className="mb-4">
                        <KpiCard 
                            title="Producto Estrella (Mes)" 
                            value={dashboardData.bestSeller} 
                            icon={<BsTrophyFill size={32} />}
                            color="warning"
                        />
                    </Col>
                    <Col md={6} lg={6} className="mb-4">
                        <KpiCard 
                            title="Sucursal con Más Ventas (Mes)" 
                            value={dashboardData.topBranch} 
                            icon={<BsAwardFill size={32} />}
                            color="info" 
                        />
                    </Col>
                </Row>
            )}

            <Row>
                <Col xl={12} className="mb-4">
                    <Card className="shadow-sm h-100 chart-card">
                        <Card.Body className="p-4">
                            <MovimientosChart movements={movements} products={products} branches={branches}/>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col xl={8} className="mb-4">
                    <Card className="shadow-sm h-100 chart-card">
                        <Card.Body className="p-4">
                            <VentasChart movements={movements} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={4} className="mb-4">
                    <Card className="shadow-sm h-100 low-stock-card">
                        <Card.Header as="h5" className="bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                            Productos con Bajo Stock
                            {totalLowStockPages > 1 && (
                                <div className="pagination-controls">
                                    <Button variant="link" onClick={handlePrevPage} disabled={lowStockPage === 0} className="p-0 me-2">
                                        <BsArrowLeftCircleFill size={20} />
                                    </Button>
                                    <span className="page-indicator">{lowStockPage + 1} / {totalLowStockPages}</span>
                                    <Button variant="link" onClick={handleNextPage} disabled={lowStockPage === totalLowStockPages - 1} className="p-0 ms-2">
                                        <BsArrowRightCircleFill size={20} />
                                    </Button>
                                </div>
                            )}
                        </Card.Header>
                        <Card.Body className="pt-0 px-4">
                            <Table responsive className="low-stock-table">
                                <thead>
                                    <tr><th>Producto</th><th className="text-end">Stock</th></tr>
                                </thead>
                                <tbody>
                                    {paginatedLowStockProducts.length > 0 ? (
                                        paginatedLowStockProducts.map(product => (
                                            <tr key={`${product.id}-${product.branch}`}>
                                                <td>
                                                    <div>{product.productName}</div>
                                                    <small className="text-muted">{product.branchName}</small>
                                                </td>
                                                <td className="text-end">
                                                    <Badge bg="danger-light" text="danger" pill className="p-2">
                                                        {product.current_stock}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="text-center text-muted py-3">No hay productos con bajo stock.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showSaleModal} onHide={handleCloseSaleModal} centered>
                <Modal.Header closeButton><Modal.Title>Registrar Nueva Venta</Modal.Title></Modal.Header>
                <Modal.Body>
                    <AppleStyleAlert message={alertMessage} onClose={() => setAlertMessage('')} />
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Desde Sucursal</Form.Label>
                            {user && user.role === 'admin' ? (
                                <Form.Select name="branch" value={saleData.branch} onChange={handleSaleFormChange}>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </Form.Select>
                            ) : (
                                <Form.Control 
                                    type="text" 
                                    value={branches.find(b => b.id === user.branch)?.name || 'Cargando...'} 
                                    disabled 
                                    readOnly 
                                />
                            )}
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Producto</Form.Label>
                            <Select
                                options={productOptions}
                                value={productOptions.find(option => option.value === saleData.product)}
                                onChange={handleProductSelect}
                                isDisabled={!saleData.branch}
                                isClearable
                                placeholder="Buscar y seleccionar un producto..."
                                noOptionsMessage={() => "No se encontraron productos"}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Cantidad</Form.Label>
                            <Form.Control type="number" name="quantity" value={saleData.quantity} onChange={handleSaleFormChange} min="1" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Descripción (Opcional)</Form.Label>
                            <Form.Control as="textarea" rows={2} name="description" value={saleData.description} onChange={handleSaleFormChange} placeholder="Ej: Venta a cliente final" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseSaleModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleCreateSale}>Confirmar Venta</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Home;
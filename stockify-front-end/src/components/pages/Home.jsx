import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { BsBoxSeam, BsCashCoin, BsPeople, BsArrowDownCircle, BsPlus } from 'react-icons/bs';
import VentasChart from '../../components/VentasChart';
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

const Home = () => {
    // 1. OBTENEMOS TODOS LOS DATOS Y FUNCIONES DE LOS CONTEXTOS
    const { products, branchStock, movements, branches, users, loading, addMovement } = useData();
    const { user } = useAuth();
    
    const [showSaleModal, setShowSaleModal] = useState(false);
    // El estado del formulario ahora guardará el ID de la sucursal
    const [saleData, setSaleData] = useState({
        product: '',
        quantity: 1,
        branch: '', 
        description: ''
    });

    // --- LÓGICA PARA MANEJAR EL MODAL ---
    const handleShowSaleModal = () => {
        let initialBranchId = '';
        if (user && user.role === 'employee') {
            initialBranchId = user.branch; // El ID de la sucursal del empleado
        } else if (branches && branches.length > 0) {
            initialBranchId = branches[0].id; // La primera sucursal para el admin
        }
        setSaleData({ product: '', quantity: 1, branch: initialBranchId, description: '' });
        setShowSaleModal(true);
    };
    const handleCloseSaleModal = () => setShowSaleModal(false);

    const handleSaleFormChange = (e) => {
        const { name, value } = e.target;
        // Si cambia la sucursal, reseteamos el producto seleccionado
        if (name === 'branch') {
            setSaleData({ ...saleData, branch: value, product: '' });
        } else {
            setSaleData({ ...saleData, [name]: value });
        }
    };

    const handleCreateSale = async () => {
        if (!saleData.product || !saleData.branch || !saleData.quantity) {
            alert("Por favor, selecciona un producto, sucursal y cantidad.");
            return;
        }
        try {
            await addMovement({
                movement_type: 'outgoing',
                product: parseInt(saleData.product),
                branch: parseInt(saleData.branch),
                quantity: parseInt(saleData.quantity),
                description: saleData.description || `Venta desde Dashboard`,
                user: user.id
            });
            alert(`¡Venta registrada con éxito!`);
            handleCloseSaleModal();
        } catch(error) {
            console.log("La API devolvió un error al crear la venta.");
            const errorMessage = error.response?.data?.detail || "Ocurrió un error.";
            alert(errorMessage);
        }
    };

    // --- CÁLCULOS DINÁMICOS PARA EL DASHBOARD (usando useMemo para optimizar) ---
    const dashboardData = useMemo(() => {
        if (loading || !products.length || !branchStock.length || !movements.length || !users.length) {
            return { totalProducts: 0, lowStockCount: 0, monthlySales: 0, totalUsersInScope: 0, lowStockProducts: [] };
        }

        // --- CÁLCULO DE PRODUCTOS CON BAJO STOCK (sin cambios) ---
        const lowStockItems = branchStock.filter(p => p.current_stock <= 10)
            .map(stockItem => {
                const productDetails = products.find(p => p.id === stockItem.product);
                return { ...stockItem, productName: productDetails?.name || 'N/A' };
            });

        // --- CÁLCULO DE VENTAS DEL MES (CON LA CORRECCIÓN) ---
        
        // 1. Obtenemos el mes y año actual fuera del bucle para eficiencia.
        const now = new Date();
        const currentMonth = now.getMonth(); // 0 = Enero, 7 = Agosto, etc.
        const currentYear = now.getFullYear();

        const salesValue = movements
            .filter(m => {
                // 2. Creamos un objeto Date para cada movimiento para poder compararlo.
                const movementDate = new Date(m.date);
                
                // 3. Devolvemos true solo si el movimiento es una venta Y es del mes y año actual.
                return m.movement_type === 'outgoing' &&
                    movementDate.getMonth() === currentMonth &&
                    movementDate.getFullYear() === currentYear;
            })
            .reduce((sum, mov) => {
                const product = products.find(p => p.id === mov.product);
                // Si el producto no se encuentra o no tiene precio, no suma nada.
                if (!product || !product.price) return sum; 
                return sum + (parseFloat(product.price) * mov.quantity);
            }, 0);

        // --- LÓGICA PARA CONTAR USUARIOS (sin cambios) ---
        let totalUsersInScope = 0;
        if (user.role === 'admin') {
            totalUsersInScope = users.length;
        } else if (user.role === 'employee') {
            totalUsersInScope = users.filter(u => u.branch === user.branch).length;
        }

        return {
            totalProducts: products.length,
            lowStockCount: lowStockItems.length,
            monthlySales: salesValue,
            totalUsersInScope: totalUsersInScope,
            lowStockProducts: lowStockItems
        };
    }, [products, branchStock, movements, users, loading, user]);

    // --- LÓGICA PARA FILTRAR PRODUCTOS DISPONIBLES EN EL MODAL DE VENTA ---
    const availableProductsForSale = useMemo(() => {
        if (!saleData.branch) return [];
        // 1. Encontrar el stock de la sucursal seleccionada
        const stockInSelectedBranch = branchStock.filter(
            item => item.branch === parseInt(saleData.branch) && item.current_stock > 0
        );
        // 2. Obtener los IDs de esos productos en stock
        const availableProductIds = stockInSelectedBranch.map(item => item.product);
        // 3. Filtrar la lista de productos completa para obtener los detalles
        return products.filter(p => availableProductIds.includes(p.id));
    }, [saleData.branch, branchStock, products]);

    const formatCurrency = (number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number);

    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }

    return (
        <Container fluid>
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
                {/* La tarjeta de usuarios ahora es dinámica */}
                <Col md={6} lg={3} className="mb-4"><KpiCard title={user.role === 'admin' ? "Total de Usuarios" : "Usuarios en tu Sucursal"} value={dashboardData.totalUsersInScope} icon={<BsPeople size={32} />} color="info" /></Col>
            </Row>

            <Row>
                <Col xl={8} className="mb-4">
                    <Card className="shadow-sm h-100 chart-card">
                        <Card.Body className="p-4"><VentasChart movements={movements} products={products} /></Card.Body>
                    </Card>
                </Col>
                <Col xl={4} className="mb-4">
                    <Card className="shadow-sm h-100 low-stock-card">
                        <Card.Header as="h5" className="bg-transparent border-0 pt-4 px-4">Productos con Bajo Stock</Card.Header>
                        <Card.Body className="pt-0 px-4">
                            <Table responsive className="low-stock-table">
                                <thead>
                                    <tr><th>Producto</th><th className="text-end">Stock</th></tr>
                                </thead>
                                <tbody>
                                    {dashboardData.lowStockProducts.map(product => (
                                        <tr key={product.id}>
                                            <td>{product.productName}</td>
                                            <td className="text-end"><Badge bg="danger-light" text="danger" pill className="p-2">{product.current_stock}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showSaleModal} onHide={handleCloseSaleModal} centered>
                <Modal.Header closeButton><Modal.Title>Registrar Nueva Venta</Modal.Title></Modal.Header>
                <Modal.Body>
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
                            <Form.Select 
                                name="product" 
                                value={saleData.product} 
                                onChange={handleSaleFormChange}
                                disabled={!saleData.branch}
                            >
                                <option value="">
                                    {availableProductsForSale.length > 0 ? "Selecciona un producto..." : "No hay productos en stock"}
                                </option>
                                {availableProductsForSale.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
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

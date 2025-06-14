import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { BsBoxSeam, BsCashCoin, BsPeople, BsArrowDownCircle, BsPlus } from 'react-icons/bs';
import VentasChart from '../../components/VentasChart'; 
import { useData } from '../../context/DataContext'; 
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
    // --- 2. AÑADIMOS ESTADOS Y OBTENEMOS DATOS/FUNCIONES DEL CONTEXTO ---
    const { products, branchStock, addMovement } = useData(); // Obtenemos datos y la función para añadir movimientos
    const [showSaleModal, setShowSaleModal] = useState(false); // Estado para el modal
    const [saleData, setSaleData] = useState({ // Estado para el formulario de venta
        productId: '',
        quantity: 1,
        branchName: 'Depósito Central' // Valor por defecto
    });

    // --- FUNCIONES PARA MANEJAR EL MODAL Y EL FORMULARIO ---
    const handleShowSaleModal = () => setShowSaleModal(true);
    const handleCloseSaleModal = () => setShowSaleModal(false);

    const handleSaleFormChange = (e) => {
        setSaleData({ ...saleData, [e.target.name]: e.target.value });
    };

    const handleCreateSale = () => {
        const product = products.find(p => p.id === parseInt(saleData.productId));
        if (!product) {
            alert("Por favor, selecciona un producto.");
            return;
        }

        // 3. LLAMAMOS A LA FUNCIÓN DEL CONTEXTO PARA CREAR EL MOVIMIENTO
        addMovement({
            type: 'outgoing',
            productName: product.name,
            productId: parseInt(saleData.productId),
            quantity: parseInt(saleData.quantity),
            branchName: saleData.branchName,
            description: `Venta desde Dashboard`
        });
        
        alert(`¡Venta de ${saleData.quantity}x ${product.name} registrada con éxito!`);
        handleCloseSaleModal();
    };

    // Ahora, los productos con bajo stock se calculan desde el contexto global
    const lowStockProducts = branchStock.filter(p => p.current_stock <= 10);

    return (
        <Container fluid>
            <header className="d-flex align-items-center justify-content-between dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">Un resumen de la actividad de tu negocio.</p>
                </div>
                {/* 4. El botón ahora abre el modal */}
                <Button className="btn-create-sale" onClick={handleShowSaleModal}>
                    <BsPlus size={22} className="me-2" />
                    Crear Venta
                </Button>
            </header>

            <Row>
                {/* Los KPIs ahora pueden ser dinámicos */}
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Total de Productos" value={products.length} icon={<BsBoxSeam size={32} />} color="primary" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Ventas del Mes" value="$124,850" icon={<BsCashCoin size={32} />} color="success" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Productos con Bajo Stock" value={lowStockProducts.length} icon={<BsArrowDownCircle size={32} />} color="warning" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Total de Clientes" value="43" icon={<BsPeople size={32} />} color="info" /></Col>
            </Row>

            <Row>
                <Col xl={8} className="mb-4">
                    <Card className="shadow-sm h-100 chart-card">
                        <Card.Body className="p-4"><VentasChart /></Card.Body>
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
                                    {lowStockProducts.map(product => (
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

            {/* --- 5. AÑADIMOS EL MODAL PARA CREAR VENTA --- */}
            <Modal show={showSaleModal} onHide={handleCloseSaleModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Registrar Nueva Venta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Producto</Form.Label>
                            <Form.Select name="productId" value={saleData.productId} onChange={handleSaleFormChange}>
                                <option>Selecciona un producto...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cantidad</Form.Label>
                            <Form.Control type="number" name="quantity" value={saleData.quantity} onChange={handleSaleFormChange} min="1" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Desde Sucursal</Form.Label>
                            <Form.Select name="branchName" value={saleData.branchName} onChange={handleSaleFormChange}>
                                {/* En una app real, la lista de sucursales también vendría del contexto */}
                                <option>Depósito Central</option>
                                <option>Sucursal Córdoba</option>
                            </Form.Select>
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
import React from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { BsBoxSeam, BsCashCoin, BsPeople, BsArrowDownCircle, BsPlus } from 'react-icons/bs';
import VentasChart from '../../components/VentasChart'; // Asegúrate de que la ruta sea correcta
import './Home.css';

// NUEVO COMPONENTE KPI CARD - Más limpio y moderno
const KpiCard = ({ title, value, icon, color }) => (
    <div className="kpi-card shadow-sm">
        <div className={`kpi-icon-wrapper text-${color}`}>
        {icon}
        </div>
        <div>
        <h6 className="kpi-title">{title}</h6>
        <h3 className="kpi-value">{value}</h3>
        </div>
    </div>
);

const Home = () => {
    const lowStockProducts = [
        { id: 1, name: 'Remera Champion', stock: 4 },
        { id: 2, name: 'Juego de Alicates', stock: 2 },
        { id: 3, name: 'Membrana Líquida', stock: 8 },
    ];

    return (
        <Container fluid>
        <header className="d-flex align-items-center justify-content-between dashboard-header">
            <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Un resumen de la actividad de tu negocio.</p>
            </div>
            <Button className="btn-create-sale">
            <BsPlus size={22} className="me-2" />
            Crear Venta
            </Button>
        </header>

        <Row>
            <Col md={6} lg={3} className="mb-4"><KpiCard title="Total de Productos" value="152" icon={<BsBoxSeam size={32} />} color="primary" /></Col>
            <Col md={6} lg={3} className="mb-4"><KpiCard title="Ventas del Mes" value="$124,850" icon={<BsCashCoin size={32} />} color="success" /></Col>
            <Col md={6} lg={3} className="mb-4"><KpiCard title="Productos con Bajo Stock" value="8" icon={<BsArrowDownCircle size={32} />} color="warning" /></Col>
            <Col md={6} lg={3} className="mb-4"><KpiCard title="Total de Clientes" value="43" icon={<BsPeople size={32} />} color="info" /></Col>
        </Row>

        <Row>
            <Col xl={8} className="mb-4">
            <Card className="shadow-sm h-100 chart-card">
                <Card.Body className="p-4">
                <VentasChart />
                </Card.Body>
            </Card>
            </Col>

            <Col xl={4} className="mb-4">
            <Card className="shadow-sm h-100 low-stock-card">
                <Card.Header as="h5" className="bg-transparent border-0 pt-4 px-4">Productos con Bajo Stock</Card.Header>
                <Card.Body className="pt-0 px-4">
                <Table responsive className="low-stock-table">
                    <thead>
                    <tr>
                        <th>Producto</th>
                        <th className="text-end">Stock</th>
                    </tr>
                    </thead>
                    <tbody>
                    {lowStockProducts.map(product => (
                        <tr key={product.id}>
                        <td>{product.name}</td>
                        <td className="text-end"><Badge bg="danger-light" text="danger" pill className="p-2">{product.stock}</Badge></td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                </Card.Body>
            </Card>
            </Col>
        </Row>
        </Container>
    );
};

export default Home;
import React from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { BsBoxSeam, BsCashCoin, BsPeople, BsArrowDownCircle, BsPlus, BsArrowRight } from 'react-icons/bs';
import VentasChart from '../../components/VentasChart'; // Importamos el gráfico

// Un nuevo componente de tarjeta para los indicadores (KPIs)
const KpiCard = ({ title, value, icon, color }) => (
    // LA SOLUCIÓN ESTÁ AQUÍ: Añadimos la clase h-100 a la tarjeta
    <Card className={`shadow-sm border-start border-5 border-${color} h-100`}>
        <Card.Body>
            <Row className="align-items-center">
                <Col xs="auto">
                    <div className={`p-3 rounded-circle bg-${color}-light`}>
                        {icon}
                    </div>
                </Col>
                <Col>
                    <h6 className={`text-muted mb-1 text-${color}`}>{title}</h6>
                    <h4 className="fw-bold mb-0">{value}</h4>
                </Col>
            </Row>
        </Card.Body>
    </Card>
);

const Home = () => {
    // Datos de ejemplo para la tabla de bajo stock
    const lowStockProducts = [
        { id: 1, name: 'Remera Champion', stock: 4, supplier: 'Indumentaria Cool' },
        { id: 2, name: 'Juego de Alicates', stock: 2, supplier: 'Ferre Max' },
        { id: 3, name: 'Membrana Líquida', stock: 8, supplier: 'Weber' },
    ];

    return (
        <Container fluid>
            {/* Cabecera de la página */}
            <header className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h3 mb-0">Dashboard</h1>
                    <p className="text-muted mb-0">Resumen de la actividad de tu negocio.</p>
                </div>
                {/* ACCESO RÁPIDO PRINCIPAL */}
                <Button variant="primary" className="shadow-sm">
                    <BsPlus size={24} className="me-1" />
                    Crear Venta
                </Button>
            </header>

            {/* KPIs - Indicadores Clave de Desempeño */}
            <Row className="mb-4">
                <Col md={6} xl={3} className="mb-3"><KpiCard title="Total de Productos" value="152" icon={<BsBoxSeam size={28} />} color="primary" /></Col>
                <Col md={6} xl={3} className="mb-3"><KpiCard title="Ventas del Mes" value="$ 124,850" icon={<BsCashCoin size={28} />} color="success" /></Col>
                <Col md={6} xl={3} className="mb-3"><KpiCard title="Productos con Bajo Stock" value="8" icon={<BsArrowDownCircle size={28} />} color="warning" /></Col>
                <Col md={6} xl={3} className="mb-3"><KpiCard title="Total de Clientes" value="43" icon={<BsPeople size={28} />} color="info" /></Col>
            </Row>

            {/* Fila principal con Gráfico y Tabla */}
            <Row>
                <Col xl={8} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <VentasChart />
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={4} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header as="h5" className="bg-light">Productos con Bajo Stock</Card.Header>
                        <Card.Body>
                            <Table striped hover size="sm">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts.map(product => (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>
                                            <td><Badge bg="danger">{product.stock}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                        <Card.Footer className="text-center">
                            <Button variant="outline-primary" size="sm">
                                Ver todos <BsArrowRight />
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
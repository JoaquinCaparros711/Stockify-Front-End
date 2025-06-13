import React from 'react';
import { Container, Row, Col, Button, Card, Dropdown, Table, Badge, Form } from 'react-bootstrap';
import { BsPlus, BsBoxSeam, BsGraphUp, BsWallet2, BsThreeDotsVertical, BsPencilFill, BsTrashFill } from 'react-icons/bs';
import "./Product.css";

const mockProducts = [
    { id: 1, name: 'Mate Imperial Calabaza', description: 'Interior calabaza, forrado en cuero', price: 28000.00, category: 'Mates', estado: 'Activo' },
    { id: 2, name: 'Mate Camionero Algarrobo', description: 'Interior madera, virola de acero', price: 14500.00, category: 'Mates', estado: 'Activo' },
    { id: 3, name: 'Matera 100% Cuero', description: 'Material cuero, correa ajustable', price: 30000.00, category: 'Materas', estado: 'Inactivo' },
    { id: 4, name: 'Lata Matera "MATERO"', description: 'Set de yerbera y azucarera', price: 9000.00, category: 'Latas', estado: 'Activo' }
];

// Usamos el mismo diseño de KpiCard que en el Home para consistencia
const KpiCard = ({ title, value, icon, color }) => (
    <div className="kpi-card shadow-sm">
        <div className={`kpi-icon-wrapper text-${color}`}>{icon}</div>
        <div>
            <h6 className="kpi-title">{title}</h6>
            <h3 className="kpi-value">{value}</h3>
        </div>
    </div>
);

const Products = () => {
    return (
        // Contenedor principal con la animación de entrada
        <Container fluid className="products-container">
            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Catálogo de Productos</h1>
                    <p className="page-subtitle">Administra los productos base de tu negocio.</p>
                </div>
                <Button className="btn-add-product"><BsPlus size={22} className="me-2" />Agregar Producto</Button>
            </header>

            <Row className="mb-4">
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Productos Activos" value="152" icon={<BsBoxSeam size={32} />} color="primary" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Valor de Catálogo" value="$4.5M" icon={<BsWallet2 size={32} />} color="success" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Categorías" value="8" icon={<BsGraphUp size={32} />} color="info" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Productos Inactivos" value="12" icon={<BsBoxSeam size={32} />} color="secondary" /></Col>
            </Row>

            <Card className="shadow-sm products-table-card">
                <div className="products-toolbar">
                    <Row className="align-items-center">
                        <Col xs={12} md={5}><h5 className="mb-0">Lista de productos</h5></Col>
                        <Col xs={12} md={7} className="d-flex justify-content-end align-items-center flex-wrap">
                            {/* Aquí puedes volver a poner tu barra de búsqueda y filtros si lo deseas */}
                        </Col>
                    </Row>
                </div>
                <Table responsive className="products-table">
                    <thead>
                        <tr>
                            <th style={{width: '5%'}}><Form.Check type="checkbox" /></th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockProducts.map((product) => (
                            <tr key={product.id}>
                                <td><Form.Check type="checkbox" /></td>
                                <td className="product-name-cell">
                                    <div>{product.name}</div>
                                    <small className="text-muted">{product.description}</small>
                                </td>
                                <td>{product.category}</td>
                                <td className="fw-bold">${product.price.toFixed(2)}</td>
                                <td><Badge pill bg={product.estado === 'Activo' ? 'success' : 'secondary'}>{product.estado}</Badge></td>
                                <td className="text-end">
                                    <Dropdown align="end">
                                        <Dropdown.Toggle as="button" bsPrefix="p-0" className="btn btn-link text-muted"><BsThreeDotsVertical /></Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#"><BsPencilFill className="me-2" /> Editar Producto</Dropdown.Item>
                                            <Dropdown.Item href="#" className="text-danger"><BsTrashFill className="me-2" /> Eliminar Producto</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card> 
        </Container>
    );
};

export default Products;
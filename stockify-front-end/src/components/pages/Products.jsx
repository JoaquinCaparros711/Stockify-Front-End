import React from 'react';
import { Container, Row, Col, Button, Card, InputGroup, FormControl, Dropdown, Table, Badge, Form } from 'react-bootstrap';
import { BsPlus, BsBoxSeam, BsGraphUp, BsWallet2, BsThreeDotsVertical, BsPencilFill, BsTrashFill } from 'react-icons/bs';
import "./Product.css";


const mockProducts = [
    { id: 1, nombre: 'Mate Imperial Calabaza', descripcion: 'Interior calabaza, forrado en cuero', stock: 30, precio: 28000, categoria: 'Mate', estado: 'Activo', sucursal: 'Depósito Central' },
    { id: 2, nombre: 'Mate camionero Algarrobo', descripcion: 'Interior madera, virola de acero', stock: 8, precio: 14500, categoria: 'Mate', estado: 'Activo', sucursal: 'Sucursal Mendoza' },
    { id: 3, nombre: 'Matera 100% cuero', descripcion: 'Material cuero', stock: 0, precio: 30000, categoria: 'Matera', estado: 'Inactivo', sucursal: 'Depósito Central' },
    { id: 4, nombre: 'Lata MATERO', descripcion: 'Set de latas MATERO', stock: 15, precio: 9000, categoria: 'Lata', estado: 'Activo', sucursal: 'Sucursal Córdoba' }
];

const KpiCard = ({ title, value, icon, color }) => (
    <Card className={`shadow-sm border-start border-5 border-${color} h-100`}>
        <Card.Body>
            <Row className="align-items-center">
                <Col xs="auto"><div className={`p-3 rounded-circle bg-${color}-light`}>{icon}</div></Col>
                <Col>
                    <h6 className={`text-muted mb-1`}>{title}</h6>
                    <h4 className={`fw-bold mb-0 text-${color}`}>{value}</h4>
                </Col>
            </Row>
        </Card.Body>
    </Card>
);

const Products = () => {
    return (
        <Container fluid>
            <header className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    <div className="p-3 rounded bg-primary-light me-3"><BsBoxSeam size={28} className="text-primary"/></div>
                    <div>
                        <h1 className="h3 mb-0">Inventario</h1>
                        <p className="text-muted mb-0">Cree un registro detallado de todos los productos disponibles en su negocio</p>
                    </div>
                </div>
                <Button variant="primary" className="shadow-sm btn-add-product"><BsPlus size={24} className="me-1" />Agregar Producto</Button>
            </header>

            <Row className="mb-4">
                <Col md={6} lg={3} className="mb-3"><KpiCard title="En Stock" value="152" icon={<BsBoxSeam size={28} />} color="primary" /></Col>
                <Col md={6} lg={3} className="mb-3"><KpiCard title="Valor en Stock" value="$ 1.2M" icon={<BsWallet2 size={28} />} color="success" /></Col>
                <Col md={6} lg={3} className="mb-3"><KpiCard title="Ganancia estimada" value="$ 350K" icon={<BsGraphUp size={28} />} color="warning" /></Col>
                <Col md={6} lg={3} className="mb-3"><KpiCard title="Sin Stock" value="8" icon={<BsBoxSeam size={28} />} color="danger" /></Col>
            </Row>

            {/* A PARTIR DE AQUÍ REVISÁ LA ESTRUCTURA */}
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 py-3">
                    <Row className="align-items-center">
                        <Col xs={12} md={4}><h5 className="mb-0">Lista de productos</h5></Col>
                        <Col xs={12} md={8} className="d-flex flex-wrap justify-content-end align-items-center">
                            <Dropdown className="me-2 mt-2 mt-md-0">
                                <Dropdown.Toggle variant="light" id="dropdown-visibility" className='btn-export-visibility'>Visibilidad</Dropdown.Toggle>
                                <Dropdown.Menu><Dropdown.Item>Todos</Dropdown.Item></Dropdown.Menu>
                            </Dropdown>
                            <Button variant="light" className="me-2 mt-2 mt-md-0 btn-export-visibility">Exportar</Button>

                            <div className="search-bar-container mt-2 mt-md-0">
                                <FormControl
                                    placeholder="Buscar..."
                                    className="search-input"
                                />
                                <Button variant="primary" className="search-button btn-search">
                                    Buscar
                                </Button>
                            </div>

                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th><Form.Check type="checkbox" /></th>
                                <th>Nombre</th>
                                <th>Stock</th>
                                <th>Precio</th>
                                <th>Categoría</th>
                                <th>Sucursal</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockProducts.map((product) => (
                                <tr key={product.id}>
                                    <td><Form.Check type="checkbox" /></td>
                                    <td>
                                        <div>{product.nombre}</div>
                                        <small className="text-muted">{product.descripcion}</small>
                                    </td>
                                    <td><Badge bg={product.stock > 10 ? 'success-light' : 'warning-light'} text={product.stock > 10 ? 'success' : 'warning'}>{product.stock}</Badge></td>
                                    <td className="fw-bold">${product.precio.toFixed(2)}</td>
                                    <td>{product.categoria}</td>
                                    <td>{product.sucursal}</td>
                                    <td><Badge pill bg={product.estado === 'Activo' ? 'success' : 'secondary'}>{product.estado}</Badge></td>
                                    <td>
                                        <Dropdown align="end">
                                            <Dropdown.Toggle as="button" bsPrefix="p-0" className="btn btn-link text-muted"><BsThreeDotsVertical /></Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#"><BsPencilFill className="me-2" /> Editar</Dropdown.Item>
                                                <Dropdown.Item href="#" className="text-danger"><BsTrashFill className="me-2" /> Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center bg-white border-0">
                    <small className="text-muted">Mostrando 4 de 152 registros</small>
                    <div>
                        <Button className='btn-back' variant="light" size="sm">Anterior</Button>
                        <Button variant="primary" size="sm" className="ms-2 btn-following">Siguiente</Button>
                    </div>
                </Card.Footer>
            </Card> 

        </Container>
    );
};

export default Products;
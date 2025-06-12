import React from 'react';
import {
  Container, Row, Col, Button, Card, InputGroup, FormControl, Dropdown, Table, Badge, Form // <-- AÑADIMOS 'Form' AQUÍ
} from 'react-bootstrap';
import { BsPlus, BsBoxSeam, BsGraphUp, BsWallet2, BsThreeDotsVertical } from 'react-icons/bs'; // <-- Quité el ícono no usado

// Componente reutilizable para las tarjetas de estadísticas de la parte superior
const StatisticCard = ({ title, value, icon, colorVariant }) => (
    <Card className={`shadow-sm border-0 mb-4`}>
        <Card.Body>
        <div className="d-flex align-items-center">
            <div className={`p-3 rounded me-3 bg-${colorVariant}-light`}>
            <BsBoxSeam size={24} className={`text-${colorVariant}`} />
            </div>
            <div>
            <p className="mb-0 text-muted">{title}</p>
            <h4 className="mb-0 fw-bold">{value}</h4>
            </div>
        </div>
        </Card.Body>
    </Card>
);

const Products = () => {
    return (
        <Container fluid>
        {/* Cabecera de la página */}
        <header className="d-flex flex-wrap align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
                <div className="p-3 rounded-circle bg-light me-3">
                    <BsBoxSeam size={28} className="text-primary"/>
                </div>
                <div>
                    <h1 className="h3 mb-0">Inventario</h1>
                    <p className="text-muted mb-0">Cree un registro detallado de todos los productos disponibles en su negocio</p>
                </div>
            </div>
            <div className="mt-3 mt-md-0">
                <Button variant="primary" className="shadow-sm">
                    <BsPlus size={24} className="me-1" />
                    Agregar Producto
                </Button>
            </div>
        </header>

        {/* Tarjetas de estadísticas */}
        <Row>
            <Col md={6} lg={3}>
            <StatisticCard title="En Stock" value="0" icon={<BsBoxSeam />} colorVariant="info" />
            </Col>
            <Col md={6} lg={3}>
            <StatisticCard title="Valor en Stock" value="$ 0" icon={<BsWallet2 />} colorVariant="success" />
            </Col>
            <Col md={6} lg={3}>
            <StatisticCard title="Costo de Stock" value="$ 0" icon={<BsWallet2 />} colorVariant="primary" />
            </Col>
            <Col md={6} lg={3}>
            <StatisticCard title="Ganancia estimada" value="$ 0" icon={<BsGraphUp />} colorVariant="warning" />
            </Col>
        </Row>

        {/* Sección de la lista de productos */}
        <Card className="shadow-sm border-0">
            <Card.Body>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Lista de productos</h5>
                <div className="d-flex flex-wrap justify-content-end align-items-center">
                <Dropdown className="me-2 mt-2 mt-md-0">
                    <Dropdown.Toggle variant="light" id="dropdown-visibility" className="shadow-sm border">
                    Visibilidad
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                    <Dropdown.Item>Todos</Dropdown.Item>
                    <Dropdown.Item>Activos</Dropdown.Item>
                    <Dropdown.Item>Inactivos</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Button variant="light" className="shadow-sm border me-2 mt-2 mt-md-0">
                    Exportar
                </Button>
                <InputGroup style={{ width: '250px' }} className="mt-2 mt-md-0">
                    <FormControl
                        placeholder="Buscar..."
                        className="shadow-sm border-end-0"
                    />
                    <Button variant="light" className="border">Buscar</Button>
                    </InputGroup>
                </div>
            </div>
            
            <Table responsive hover>
                <thead>
                <tr>
                    <th><Form.Check type="checkbox" /></th>
                    <th>Nombre</th>
                    <th>Stock</th>
                    <th>Precio de Venta</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {/* Ejemplo de un producto - puedes mapear tus datos aquí */}
                <tr>
                    <td><Form.Check type="checkbox" /></td>
                    <td>Remera Champion</td>
                    <td><Badge bg="success-light" text="success">30</Badge></td>
                    <td className="fw-bold">$1802.5</td>
                    <td><Badge pill bg="success">Activo</Badge></td>
                    <td>
                    <Dropdown align="end">
                        <Dropdown.Toggle as="button" bsPrefix="p-0" className="btn btn-link text-muted">
                            <BsThreeDotsVertical />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item>Editar</Dropdown.Item>
                            <Dropdown.Item className="text-danger">Eliminar</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    </td>
                </tr>
                {/* Fin del ejemplo */}
                <tr>
                    <td colSpan="6" className="text-center text-muted pt-4 pb-4">
                        No hay más productos para mostrar.
                    </td>
                </tr>
                </tbody>
            </Table>

            </Card.Body>
        </Card>
        </Container>
    );
};

export default Products;
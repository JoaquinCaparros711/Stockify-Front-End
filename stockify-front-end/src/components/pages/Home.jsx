import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { BsHouse, BsCheckCircleFill, BsCalendarEvent, BsHourglassSplit } from 'react-icons/bs';


const StatusCard = ({ icon, title, value, detail }) => (
    <Col md={4} className="mb-3">
        <div className="d-flex align-items-center bg-warning text-dark p-3 rounded h-100">
            <div className="fs-1 me-3">{icon}</div>
            <div>
                <div className="fw-bold">{title}</div>
                <div className="fs-5">{value}</div>
                {detail && <div className="text-muted small">{detail}</div>}
            </div>
        </div>
    </Col>
);

const Home = () => {
    return (
        <Container fluid>
            {/* Cabecera de la página */}
            <header className="d-flex align-items-center mb-4">
                <div className="p-3 rounded-circle bg-light me-3">
                    <BsHouse size={28} className="text-primary"/>
                </div>
                <div>
                    <h1 className="h3 mb-0">Inicio</h1>
                    <p className="text-muted mb-0">Podrá ver el estado de su cuenta y realizar el pago del programa</p>
                </div>
            </header>

            {/* Tarjeta de Estado de la cuenta */}
            <Card className="mb-4 shadow-sm">
                <Card.Header as="h5" className="bg-light">Estado de la cuenta</Card.Header>
                <Card.Body>
                    <Row>
                        <StatusCard 
                            icon={<BsCheckCircleFill />}
                            title="Estado"
                            value="Prueba"
                        />
                        <StatusCard 
                            icon={<BsCalendarEvent />}
                            title="Último pago"
                            value="..."
                        />
                        <StatusCard 
                            icon={<BsHourglassSplit />}
                            title="Vencimiento"
                            value="15-06-2025"
                            detail="(9 Días restantes)"
                        />
                    </Row>
                </Card.Body>
            </Card>

            {/* Tarjetas inferiores */}
            <Row>
                <Col lg={7} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Header as="h5" className="bg-light">Sistema Stock Web</Card.Header>
                        <Card.Body>
                            <Card.Title>Completo</Card.Title>
                            <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                                <span>Precio</span>
                                <span className="fw-bold text-primary fs-5">$30.000</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center pt-2">
                                <span>Extender</span>
                                <Button variant="link" className="text-success fw-bold">+30 Días</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Header as="h5" className="bg-light">Comunicados</Card.Header>
                        <Card.Body style={{maxHeight: '300px', overflowY: 'auto'}}>
                            <div className="mb-3">
                                <small className="text-muted">Hace 2 semanas</small>
                                <p>
                                    La aplicación de <strong>Mercado Pago ya está funcional</strong>, si tienen algún
                                    inconveniente con los pagos comuníquense con <strong>atención al cliente</strong>.
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
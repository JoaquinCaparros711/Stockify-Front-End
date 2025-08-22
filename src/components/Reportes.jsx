import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Table, Spinner } from 'react-bootstrap';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { format, startOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { CSVLink } from 'react-csv';
import { BsDownload } from 'react-icons/bs';
import "./Reportes.css";


const Reportes = () => {
    const { movements, products, loading } = useData();
    const { user } = useAuth();
    
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    
    const reportData = useMemo(() => {
        if (loading || !movements.length || !products.length) {
            return { sales: [], totalValue: 0, totalItems: 0 };
        }

        const productMap = new Map(products.map(p => [p.id, p]));
        
        const filteredSales = movements.filter(mov => {
            if (mov.movement_type !== 'outgoing') return false;
            
            const movDate = new Date(mov.date);
            const start = parseISO(startDate);
            const end = parseISO(endDate);
            end.setHours(23, 59, 59);
            
            return isWithinInterval(movDate, { start, end });
        });

        let totalValue = 0;
        let totalItems = 0;

        filteredSales.forEach(mov => {
            const product = productMap.get(mov.product);
            if (product) {
                const saleValue = (parseFloat(product.price) || 0) * mov.quantity;
                totalValue += saleValue;
                totalItems += mov.quantity;
            }
        });

        const sortedSales = filteredSales.sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
            sales: sortedSales,
            totalValue,
            totalItems,
        };

    }, [movements, products, startDate, endDate, loading]);

    // --- LÓGICA DE CSV MODIFICADA ---
    const getCsvData = () => {
        const detailHeaders = ['Fecha', 'Producto', 'Sucursal', 'Vendido Por', 'Cantidad', 'Precio Unitario', 'Total Venta'];

        const detailRows = reportData.sales.map(item => {
            const product = products.find(p => p.id === item.product);
            const price = product ? parseFloat(product.price).toFixed(2) : '0.00';
            const total = product ? (item.quantity * parseFloat(product.price)).toFixed(2) : '0.00';
            
            return [
                format(new Date(item.date), 'dd/MM/yyyy'),
                item.product_name,
                item.branch_name,
                item.user_name,
                item.quantity,
                price,
                total
            ];
        });

        const data = [
            ['Reporte de Ventas - Stockify'],
            [],
            ['Período Desde:', format(parseISO(startDate), 'dd/MM/yyyy')],
            ['Período Hasta:', format(parseISO(endDate), 'dd/MM/yyyy')],
            ['Reporte Generado Por:', user.name],
            [],
            ['Resumen General'],
            // Usamos formato de texto simple para los números, Excel se encargará del resto
            ['Ventas Totales:', reportData.totalValue.toFixed(2)],
            ['Total de Items Vendidos:', reportData.totalItems],
            ['Cantidad de Transacciones:', reportData.sales.length],
            [],
            ['Detalle de Ventas'],
            detailHeaders,
            ...detailRows
        ];

        return data;
    };


    if (loading) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner /></Container>;
    }
    
    if (user.role !== 'admin') {
        return <Container><h3 className="text-center mt-5">No tienes permiso para acceder a esta sección.</h3></Container>
    }

    return (
        <Container fluid className="reports-container">
            <header className="page-header">
                <h1 className="page-title">Reportes de Ventas</h1>
                <p className="page-subtitle">Analiza el rendimiento de tu negocio y exporta los datos.</p>
            </header>

            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="align-items-end g-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Fecha de Inicio</Form.Label>
                                <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Fecha de Fin</Form.Label>
                                <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={4} className="d-flex justify-content-end">
                            {/* --- COMPONENTE CSVLink MODIFICADO --- */}
                            <CSVLink
                                data={getCsvData()}
                                filename={`Reporte_Ventas_${startDate}_a_${endDate}.csv`}
                                className="btn btn-success"
                                target="_blank"
                                separator={";"} // <-- ¡AÑADIMOS EL SEPARADOR DE PUNTO Y COMA!
                            >
                                <BsDownload className="me-2" />
                                Exportar Reporte
                            </CSVLink>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            
            <Row>
                <Col md={4} className="mb-4">
                    <Card className="text-center h-100 shadow-sm">
                        <Card.Body>
                            <Card.Title>Ventas Totales</Card.Title>
                            <Card.Text as="h2" className="fw-bold">
                                {reportData.totalValue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="text-center h-100 shadow-sm">
                        <Card.Body>
                            <Card.Title>Productos Vendidos</Card.Title>
                            <Card.Text as="h2" className="fw-bold">
                                {reportData.totalItems}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="text-center h-100 shadow-sm">
                        <Card.Body>
                            <Card.Title>Total de Transacciones</Card.Title>
                            <Card.Text as="h2" className="fw-bold">
                                {reportData.sales.length}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Card.Header><h5 className="mb-0">Detalle de Ventas en el Período</h5></Card.Header>
                <Table responsive striped hover>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Sucursal</th>
                            <th>Vendido Por</th>
                            <th className="text-end">Cantidad</th>
                            <th className="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.sales.map(item => (
                            <tr key={item.id}>
                                <td>{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                                <td>{item.product_name}</td>
                                <td>{item.branch_name}</td>
                                <td>{item.user_name}</td>
                                <td className="text-end">{item.quantity}</td>
                                <td className="text-end">
                                    {(item.quantity * (products.find(p => p.id === item.product)?.price || 0))
                                        .toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </Container>
    );
};

export default Reportes;
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Dropdown, Table, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import { BsPlus, BsBoxSeam, BsGraphUp, BsWallet2, BsThreeDotsVertical, BsPencilFill, BsTrashFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import "./Product.css";

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
    const { products, loading, addProduct, updateProduct, deleteProduct } = useData();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', estado: 'Activo' });

    useEffect(() => {
        if (editingProduct) {
            setFormData(editingProduct);
        } else {
            setFormData({ name: '', description: '', price: '', category: '', estado: 'Activo' });
        }
    }, [editingProduct]);
    
    const handleCloseModal = () => { setShowModal(false); setEditingProduct(null); };
    const handleShowAddModal = () => { setEditingProduct(null); setShowModal(true); };
    const handleShowEditModal = (product) => { setEditingProduct(product); setShowModal(true); };
    const handleFormChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    const handleSaveChanges = async () => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
            } else {
                await addProduct(formData);
            }
            handleCloseModal();
        } catch (error) {
            console.log("El formulario no se cerrará debido a un error de la API.");
        }
    };

    const handleDeleteProduct = (id) => {
        deleteProduct(id);
    };

    const totalCatalogValue = products.reduce((sum, product) => sum + parseFloat(product.price || 0), 0);

    // Función para formatear el número como moneda ARS
    const formatCurrency = (number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(number);
    };


    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container fluid className="products-container">
            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Catálogo de Productos</h1>
                    <p className="page-subtitle">Administra los productos base de tu negocio.</p>
                </div>
                <Button className="btn-add-product" onClick={handleShowAddModal}>
                    <BsPlus size={22} className="me-2" />
                    Agregar Producto
                </Button>
            </header>

            <Row className="mb-4">
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Productos Activos" value={products.filter(p => p.estado === 'Activo').length} icon={<BsBoxSeam size={32} />} color="primary" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Valor de Catálogo" value={formatCurrency(totalCatalogValue)} icon={<BsWallet2 size={32} />} color="success" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Categorías" value={[...new Set(products.map(p => p.category))].length} icon={<BsGraphUp size={32} />} color="info" /></Col>
                <Col md={6} lg={3} className="mb-4"><KpiCard title="Productos Inactivos" value={products.filter(p => p.estado === 'Inactivo').length} icon={<BsBoxSeam size={32} />} color="secondary" /></Col>
            </Row>

            <Card className="shadow-sm products-table-card">
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
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td data-label="Checkbox"><Form.Check type="checkbox" /></td>
                                <td data-label="Nombre" className="product-name-cell">
                                    <div>{product.name}</div>
                                    <small className="text-muted">{product.description}</small>
                                </td>
                                <td data-label="Categoría">{product.category}</td>
                                <td data-label="Precio" className="fw-bold">${parseFloat(product.price).toFixed(2)}</td>
                                <td data-label="Estado">
                                    <Badge pill bg={product.estado === 'Activo' ? 'success' : 'secondary'}>{product.estado}</Badge>
                                </td>
                                <td data-label="Acciones" className="text-end">
                                    <Dropdown align="end">
                                        <Dropdown.Toggle as="button" bsPrefix="p-0" className="btn btn-link text-muted"><BsThreeDotsVertical /></Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleShowEditModal(product)}><BsPencilFill className="me-2" /> Editar Producto</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleDeleteProduct(product.id)} className="text-danger"><BsTrashFill className="me-2" /> Eliminar Producto</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card> 

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3"><Form.Label>Nombre del Producto</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Descripción</Form.Label><Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange} /></Form.Group>
                        <Row>
                            <Col><Form.Group className="mb-3"><Form.Label>Categoría</Form.Label><Form.Control type="text" name="category" value={formData.category} onChange={handleFormChange} /></Form.Group></Col>
                            <Col><Form.Group className="mb-3"><Form.Label>Precio</Form.Label><Form.Control type="number" name="price" value={formData.price} onChange={handleFormChange} /></Form.Group></Col>
                        </Row>
                        <Form.Group className="mb-3"><Form.Label>Estado</Form.Label><Form.Select name="estado" value={formData.estado} onChange={handleFormChange}><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></Form.Select></Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSaveChanges}>Guardar Cambios</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Products;

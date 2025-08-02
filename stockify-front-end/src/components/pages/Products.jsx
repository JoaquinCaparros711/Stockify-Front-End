import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Button, Card, Dropdown, Table, Form, Modal, Spinner } from 'react-bootstrap';
import { BsPlus, BsBoxSeam, BsGraphUp, BsWallet2, BsThreeDotsVertical, BsPencilFill, BsTrashFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext'; // 1. Importamos el hook de autenticación
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
    // 2. OBTENEMOS TODOS LOS DATOS NECESARIOS DE LOS CONTEXTOS
    const { products, loading, addProduct, updateProduct, deleteProduct } = useData();
    const { user } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', category: ''});

    useEffect(() => {
        if (editingProduct) {
            setFormData(editingProduct);
        } else {
            setFormData({ name: '', description: '', price: '', category: ''});
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
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto del catálogo?')) {
            deleteProduct(id);
        }
    };

    // --- 3. LÓGICA CLAVE PARA FILTRAR PRODUCTOS SEGÚN EL ROL ---
    const displayProducts = useMemo(() => {
        if (loading || !Array.isArray(products)) return [];
        return products;

    }, [products, loading]);


    const totalCatalogValue = displayProducts.reduce((sum, product) => sum + parseFloat(product.price || 0), 0);

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(number);
    };

    const isAdmin = user && user.role === 'admin';

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
                    <p className="page-subtitle">
                        {isAdmin ? "Administra los productos base de tu negocio." : "Productos disponibles en tu sucursal."}
                    </p>
                </div>
                {/* 4. El botón para agregar productos ahora lo ven TODOS los usuarios logueados */}
                <Button className="btn-add-product" onClick={handleShowAddModal}>
                    <BsPlus size={22} className="me-2" />
                    Agregar Producto
                </Button>
            </header>

            <Row className="mb-4">
                {/* Los KPIs ahora se basan en la lista de productos filtrada */}
                <Col md={6} lg={4} className="mb-4"><KpiCard title="Total de Productos" value={displayProducts.length} icon={<BsBoxSeam size={32} />} color="primary" /></Col>
                <Col md={6} lg={4} className="mb-4"><KpiCard title="Valor de Catálogo" value={formatCurrency(totalCatalogValue)} icon={<BsWallet2 size={32} />} color="success" /></Col>
                <Col md={6} lg={4} className="mb-4"><KpiCard title="Categorías Únicas" value={[...new Set(displayProducts.map(p => p.category))].length} icon={<BsGraphUp size={32} />} color="info" /></Col>
            </Row>

            <Card className="shadow-sm products-table-card">
                <Table responsive className="products-table">
                    <thead>
                        <tr>
                            {isAdmin && <th style={{width: '5%'}}><Form.Check type="checkbox" /></th>}
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            {/* 5. La columna de Acciones solo la ven los admins */}
                            {isAdmin && <th className="text-end">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {displayProducts.map((product) => (
                            <tr key={product.id}>
                                {isAdmin && <td data-label="Checkbox"><Form.Check type="checkbox" /></td>}
                                <td data-label="Nombre" className="product-name-cell">
                                    <div>{product.name}</div>
                                    <small className="text-muted">{product.description}</small>
                                </td>
                                <td data-label="Categoría">{product.category}</td>
                                <td data-label="Precio" className="fw-bold">${parseFloat(product.price).toFixed(2)}</td>
                                {/* 6. Las acciones de Editar/Eliminar solo las ven los admins */}
                                {isAdmin && (
                                    <td data-label="Acciones" className="text-end">
                                        <Dropdown align="end">
                                            <Dropdown.Toggle as="button" bsPrefix="p-0" className="btn btn-link text-muted"><BsThreeDotsVertical /></Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleShowEditModal(product)}><BsPencilFill className="me-2" /> Editar Producto</Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleDeleteProduct(product.id)} className="text-danger"><BsTrashFill className="me-2" /> Eliminar Producto</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                )}
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

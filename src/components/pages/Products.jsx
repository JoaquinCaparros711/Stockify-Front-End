import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Button, Card, Dropdown, Table, Form, Modal, Spinner } from 'react-bootstrap';
import { BsPlus, BsBoxSeam, BsGraphUp, BsWallet2, BsThreeDotsVertical, BsPencilFill, BsTrashFill, BsXCircleFill, BsCheckCircleFill, BsExclamationTriangleFill, BsSearch, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import "./Product.css";

const AppleStyleAlert = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="apple-style-alert">
        <BsXCircleFill className="alert-icon" />
        <span>{message}</span>
        <button onClick={onClose} className="close-alert-btn">&times;</button>
        </div>
    );
};

const AppleStyleSuccessToast = ({ message, onClose }) => {
    useEffect(() => {
        if (message) {
        const timer = setTimeout(() => { onClose(); }, 3000);
        return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;
    return (
        <div className="apple-style-toast success">
        <BsCheckCircleFill className="toast-icon" />
        <span>{message}</span>
        </div>
    );
};

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
    const { user } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '' });

    const [alertMessage, setAlertMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (editingProduct) {
        setFormData(editingProduct);
        } else {
        setFormData({ name: '', description: '', price: '', category: '' });
        }
        setAlertMessage('');
    }, [editingProduct, showModal]);

    const handleCloseModal = () => { setShowModal(false); setEditingProduct(null); };
    const handleShowAddModal = () => { setEditingProduct(null); setShowModal(true); };
    const handleShowEditModal = (product) => { setEditingProduct(product); setShowModal(true); };

    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (alertMessage) setAlertMessage('');
    };

    const handleSaveChanges = async () => {
        const trimmedName = formData.name.trim();
        if (!trimmedName) return setAlertMessage('El nombre del producto es obligatorio.');
        if (/^\d+$/.test(trimmedName)) return setAlertMessage('El nombre no puede consistir solo en números.');

        const isNameDuplicate = products.some(
        p => p.name.toLowerCase() === trimmedName.toLowerCase() && p.id !== (editingProduct ? editingProduct.id : null)
        );
        if (isNameDuplicate) return setAlertMessage('Ya existe un producto con este nombre.');

        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) return setAlertMessage('El precio debe ser un número mayor a cero.');

        try {
        if (editingProduct) {
            await updateProduct(editingProduct.id, formData);
            setSuccessMessage('¡Producto actualizado con éxito!');
        } else {
            await addProduct(formData);
            setSuccessMessage('¡Producto creado con éxito!');
        }
        handleCloseModal();
        } catch (error) {
        const apiError = error.response?.data?.name?.[0] || 'Ocurrió un error en el servidor.';
        setAlertMessage(apiError);
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setProductToDelete(null);
        setShowDeleteConfirm(false);
    };

    const handleConfirmDelete = async () => {
        if (productToDelete) {
        try {
            await deleteProduct(productToDelete.id);
            setSuccessMessage('¡Producto eliminado con éxito!');
        } catch {
            alert('Hubo un error al eliminar el producto.');
        } finally {
            handleCloseDeleteConfirm();
        }
        }
    };

    const displayProducts = useMemo(() => {
        if (loading || !Array.isArray(products)) return [];
        let filteredProducts = products;
        if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(lowercasedTerm) ||
            (product.category && product.category.toLowerCase().includes(lowercasedTerm))
        );
        }
        return filteredProducts;
    }, [products, loading, searchTerm]);

    const totalCatalogValue = displayProducts.reduce((sum, product) => sum + parseFloat(product.price || 0), 0);
    const formatCurrency = (number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = displayProducts.slice(startIndex, startIndex + itemsPerPage);

    const canAddProducts = user && (user.role === 'admin' || user.role === 'employee');

    if (loading) {
        return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="border" variant="primary" />
        </Container>
        );
    }

    return (
        <Container fluid className="products-container">
        <AppleStyleSuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />

        <header className="d-flex align-items-center justify-content-between page-header">
            <div>
            <h1 className="page-title">Catálogo de Productos</h1>
            <p className="page-subtitle">
                {user?.role === 'admin' ? "Administra los productos base de tu negocio." : "Productos disponibles para movimientos."}
            </p>
            </div>
            {canAddProducts && (
            <Button className="btn-add-product" onClick={handleShowAddModal}>
                <BsPlus size={22} className="me-2" />
                Agregar Producto
            </Button>
            )}
        </header>

        <Row className="mb-4">
            <Col md={6} lg={4} className="mb-4"><KpiCard title="Total de Productos" value={displayProducts.length} icon={<BsBoxSeam size={32} />} color="primary" /></Col>
            <Col md={6} lg={4} className="mb-4"><KpiCard title="Valor de Catálogo" value={formatCurrency(totalCatalogValue)} icon={<BsWallet2 size={32} />} color="success" /></Col>
            <Col md={6} lg={4} className="mb-4"><KpiCard title="Categorías Únicas" value={[...new Set(displayProducts.map(p => p.category))].length} icon={<BsGraphUp size={32} />} color="info" /></Col>
        </Row>

        <Card className="shadow-sm products-table-card">
            <div className="products-toolbar">
            <Row className="justify-content-between align-items-center">
                <Col xs={12} md={6}>
                <h5 className="mb-md-0">Listado de Productos</h5>
                </Col>
                <Col xs={12} md={6}>
                <div className="search-wrapper">
                    <BsSearch className="search-icon" />
                    <Form.Control
                    type="text"
                    placeholder="Buscar por nombre, categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    />
                </div>
                </Col>
            </Row>
            </div>

            <Table responsive className="products-table">
            <thead>
                <tr>
                {user?.role === 'admin' && <th style={{ width: '5%' }}><Form.Check type="checkbox" /></th>}
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                {user?.role === 'admin' && <th className="text-end">Acciones</th>}
                </tr>
            </thead>
            <tbody>
                {paginatedProducts.map((product) => (
                <tr key={product.id}>
                    {user?.role === 'admin' && <td><Form.Check type="checkbox" /></td>}
                    <td className="product-name-cell">
                    <div>{product.name}</div>
                    <small className="text-muted">{product.description}</small>
                    </td>
                    <td>{product.category}</td>
                    <td className="fw-bold">${parseFloat(product.price).toFixed(2)}</td>
                    {user?.role === 'admin' && (
                    <td className="text-end">
                        <Dropdown align="end">
                        <Dropdown.Toggle as="button" bsPrefix="p-0" className="btn btn-link text-muted"><BsThreeDotsVertical /></Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleShowEditModal(product)}><BsPencilFill className="me-2" /> Editar</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDeleteClick(product)} className="text-danger"><BsTrashFill className="me-2" /> Eliminar</Dropdown.Item>
                        </Dropdown.Menu>
                        </Dropdown>
                    </td>
                    )}
                </tr>
                ))}
            </tbody>
            </Table>

            {/* Paginación con flechitas */}
            <div className="d-flex justify-content-between align-items-center p-3">
            <Button
                variant="outline-primary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
            >
                <BsChevronLeft /> Anterior
            </Button>
            <span>Página {currentPage} de {Math.ceil(displayProducts.length / itemsPerPage)}</span>
            <Button
                variant="outline-primary"
                size="sm"
                disabled={startIndex + itemsPerPage >= displayProducts.length}
                onClick={() => setCurrentPage(prev => prev + 1)}
            >
                Siguiente <BsChevronRight />
            </Button>
            </div>
        </Card>

        {/* Modal Crear/Editar */}
        <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
            <Modal.Title>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <AppleStyleAlert message={alertMessage} onClose={() => setAlertMessage('')} />
            <Form>
                <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange} />
                </Form.Group>
                <Row>
                <Col>
                    <Form.Group className="mb-3">
                    <Form.Label>Categoría</Form.Label>
                    <Form.Control type="text" name="category" value={formData.category} onChange={handleFormChange} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3">
                    <Form.Label>Precio</Form.Label>
                    <Form.Control type="number" name="price" value={formData.price} onChange={handleFormChange} />
                    </Form.Group>
                </Col>
                </Row>
            </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveChanges}>Guardar</Button>
            </Modal.Footer>
        </Modal>

        {/* Modal Eliminar */}
        <Modal show={showDeleteConfirm} onHide={handleCloseDeleteConfirm} centered>
            <Modal.Header closeButton>
            <Modal.Title>
                <BsExclamationTriangleFill className="text-danger me-2" />
                Confirmar Eliminación
            </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            ¿Estás seguro de que quieres eliminar <strong>"{productToDelete?.name}"</strong>? Esta acción no se puede deshacer.
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDeleteConfirm}>Cancelar</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
        </Container>
    );
};

export default Products;

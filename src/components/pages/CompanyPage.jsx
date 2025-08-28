import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Form, Spinner } from 'react-bootstrap';
import { BsPencilSquare, BsSave, BsXCircle, BsXCircleFill, BsCheckCircleFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './CompanyPage.css'; // Crearemos este archivo con estilos adaptados

// --- Componentes de Notificación (Reutilizados de tu componente Products) ---
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


const CompanyPage = () => {
    const { company, updateCompany, loading } = useData();
    const { user } = useAuth();

    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Cuando los datos de la empresa cargan del context, poblamos el formulario
    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || '',
                cuit: company.cuit || '',
                email: company.email || '',
                phone: company.phone || '',
                address: company.address || '',
            });
        }
    }, [company]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    
    // Validaciones del frontend basadas en tu Serializer
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
        else if (/^\d+$/.test(formData.name.trim())) newErrors.name = "El nombre no puede ser solo números.";

        if (!formData.cuit.trim()) newErrors.cuit = "El CUIT es obligatorio.";
        else if (!/^\d+$/.test(formData.cuit.trim())) newErrors.cuit = "El CUIT solo debe contener números.";
        
        if (!formData.email.trim()) newErrors.email = "El email es obligatorio.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = "El formato del email es inválido.";

        if (!formData.phone.trim()) newErrors.phone = "El teléfono es obligatorio.";
        else if (!/^\d+$/.test(formData.phone.trim())) newErrors.phone = "El teléfono solo debe contener números.";
        
        if (!formData.address.trim()) newErrors.address = "La dirección es obligatoria.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSaveChanges = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await updateCompany(company.id, formData);
            setSuccessMessage('¡Datos de la empresa actualizados con éxito!');
            setIsEditing(false);
        } catch (error) {
            // Mapea los errores del backend al estado de errores del formulario
            const apiErrors = error.response?.data || {};
            setErrors(prev => ({ ...prev, ...apiErrors, general: "No se pudieron guardar los cambios." }));
        }
    };

    const handleCancel = () => {
        // Restaura los datos originales desde el estado global 'company'
        if (company) {
             setFormData({
                name: company.name,
                cuit: company.cuit,
                email: company.email,
                phone: company.phone,
                address: company.address,
            });
        }
        setIsEditing(false);
        setErrors({});
    };

    // Muestra un Spinner mientras carga la data inicial, igual que en Products
    if (loading && !company) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }
    
    return (
        <Container fluid className="company-page-container">
            <AppleStyleSuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />

            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Mi Empresa</h1>
                    <p className="page-subtitle">
                        Visualiza y actualiza la información clave de tu negocio.
                    </p>
                </div>
            </header>

            <Card className="shadow-sm company-card">
                <Card.Header className="company-card-header">
                    <h5 className="mb-0">Datos Generales</h5>
                    {user?.role === 'admin' && !isEditing && (
                        <Button className="btn-edit-company" onClick={() => setIsEditing(true)}>
                            <BsPencilSquare className="me-2" /> Editar Datos
                        </Button>
                    )}
                </Card.Header>
                <Card.Body>
                    {errors.general && <AppleStyleAlert message={errors.general} onClose={() => setErrors(prev => ({...prev, general: null}))} />}
                    <Form noValidate onSubmit={handleSaveChanges}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Nombre de la Empresa</Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} isInvalid={!!errors.name} disabled={!isEditing} />
                                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label>CUIT</Form.Label>
                                    <Form.Control type="text" name="cuit" value={formData.cuit} onChange={handleInputChange} isInvalid={!!errors.cuit} disabled={!isEditing} />
                                    <Form.Control.Feedback type="invalid">{errors.cuit}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                         <Row>
                            <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Email de Contacto</Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} isInvalid={!!errors.email} disabled={!isEditing} />
                                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control type="text" name="phone" value={formData.phone} onChange={handleInputChange} isInvalid={!!errors.phone} disabled={!isEditing} />
                                    <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control type="text" name="address" value={formData.address} onChange={handleInputChange} isInvalid={!!errors.address} disabled={!isEditing} />
                            <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                        </Form.Group>
                        
                        {isEditing && (
                            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                <Button variant="secondary" onClick={handleCancel}>
                                    <BsXCircle className="me-2" /> Cancelar
                                </Button>
                                <Button variant="primary" type="submit">
                                    <BsSave className="me-2" /> Guardar Cambios
                                </Button>
                            </div>
                        )}
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CompanyPage;
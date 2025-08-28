import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { BsPencilSquare, BsSave, BsXCircle } from "react-icons/bs";
import Layout from '../Layout'; // Asegúrate de usar tu componente Layout
import './CompanyPage.css'; // Crearemos este archivo para estilos

// Reutilizamos los componentes de notificación del Sidebar para consistencia
const AppleStyleAlert = ({ message, type = 'danger', onClose }) => {
    if (!message) return null;
    return (
        <Alert variant={type} onClose={onClose} dismissible className="apple-style-alert-page">
            {message}
        </Alert>
    );
};

const CompanyPage = () => {
    const { company, updateCompany, loading } = useData();
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
        // Limpiamos el error del campo que se está editando
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "El nombre es obligatorio.";
        if (formData.name && formData.name.match(/\d/)) newErrors.name = "El nombre no puede contener números.";
        if (!formData.cuit) newErrors.cuit = "El CUIT es obligatorio.";
        if (formData.cuit && !formData.cuit.match(/^\d+$/)) newErrors.cuit = "El CUIT solo debe contener números.";
        if (!formData.email) newErrors.email = "El email es obligatorio.";
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "El formato del email es inválido.";
        if (!formData.phone) newErrors.phone = "El teléfono es obligatorio.";
        if (formData.phone && !formData.phone.match(/^\d+$/)) newErrors.phone = "El teléfono solo debe contener números.";
        if (!formData.address) newErrors.address = "La dirección es obligatoria.";
        
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
            setTimeout(() => setSuccessMessage(''), 3000); // Ocultar mensaje después de 3 seg
        } catch (error) {
            const apiErrors = error.response?.data || {};
            setErrors(prev => ({ ...prev, ...apiErrors, general: "No se pudieron guardar los cambios." }));
        }
    };

    const handleCancel = () => {
        // Restaura los datos originales
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

    if (loading && !company) {
        return <Layout><div className="text-center p-5"><Spinner animation="border" /></div></Layout>;
    }
    
    if (!company) {
        return <Layout><Alert variant="warning">No se pudieron cargar los datos de la empresa.</Alert></Layout>;
    }


    return (
        <Layout>
            <div className="company-page-container">
                {successMessage && <AppleStyleAlert message={successMessage} type="success" onClose={() => setSuccessMessage('')} />}
                {errors.general && <AppleStyleAlert message={errors.general} type="danger" onClose={() => setErrors(prev => ({...prev, general: null}))} />}

                <Card className="company-card">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Datos de mi Empresa</h4>
                        {!isEditing && (
                            <Button variant="outline-primary" size="sm" onClick={() => setIsEditing(true)}>
                                <BsPencilSquare className="me-2" /> Editar
                            </Button>
                        )}
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleSaveChanges}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre de la Empresa</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.name}
                                            disabled={!isEditing}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>CUIT</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="cuit"
                                            value={formData.cuit}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.cuit}
                                            disabled={!isEditing}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.cuit}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                             <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email de Contacto</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.email}
                                            disabled={!isEditing}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Teléfono</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.phone}
                                            disabled={!isEditing}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.address}
                                    disabled={!isEditing}
                                />
                                <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                            </Form.Group>
                            
                            {isEditing && (
                                <div className="d-flex justify-content-end gap-2 mt-4">
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
            </div>
        </Layout>
    );
};

export default CompanyPage;
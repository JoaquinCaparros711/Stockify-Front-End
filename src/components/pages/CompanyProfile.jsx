import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { BsPencilFill, BsXCircleFill, BsCheckCircleFill } from 'react-icons/bs';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './CompanyProfile.css';


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


const CompanyProfile = () => {
    const { user } = useAuth();
    const { company, loading, updateCompany } = useData();

    const [formData, setFormData] = useState({});
    const [alertMessage, setAlertMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (company) {
            setFormData(company);
        }
    }, [company]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (alertMessage) setAlertMessage('');
    };

    const handleSaveChanges = async () => {
        // --- VALIDACIONES DE FRONTEND ---
        if (!formData.name.trim()) return setAlertMessage("El nombre de la empresa es obligatorio.");
        if (/^\d+$/.test(formData.name.trim())) return setAlertMessage("El nombre no puede consistir solo en números.");
        if (!formData.cuit.trim()) return setAlertMessage("El CUIT es obligatorio.");
        if (!/^\d+$/.test(formData.cuit.trim())) return setAlertMessage("El CUIT solo debe contener números.");
        if (formData.cuit.trim().length !== 11) return setAlertMessage("El CUIT debe tener 11 dígitos.");
        if (!formData.email.trim()) return setAlertMessage("El email es obligatorio.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) return setAlertMessage("El formato del email es inválido.");
        if (!formData.phone.trim()) return setAlertMessage("El teléfono es obligatorio.");
        if (!/^\d+$/.test(formData.phone.trim())) return setAlertMessage("El teléfono solo debe contener números.");
        if (!formData.address.trim()) return setAlertMessage("La dirección es obligatoria.");

        try {
            await updateCompany(formData);
            setSuccessMessage("¡Datos de la empresa actualizados con éxito!");
            setIsEditing(false);
        } catch (error) {
            const apiError = error.response?.data ? JSON.stringify(error.response.data) : "Ocurrió un error en el servidor.";
            setAlertMessage(apiError);
        }
    };

    if (loading || !company) {
        return <Container className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="primary" /></Container>;
    }

    return (
        <Container fluid className="company-profile-container">
            <AppleStyleSuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />

            <header className="d-flex align-items-center justify-content-between page-header">
                <div>
                    <h1 className="page-title">Perfil de la Empresa</h1>
                    <p className="page-subtitle">Gestiona la información de **{company.name}**.</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="btn-edit-profile">
                        <BsPencilFill className="me-2" /> Editar
                    </Button>
                )}
            </header>

            <Card className="shadow-sm p-4">
                <Card.Body>
                    <AppleStyleAlert message={alertMessage} onClose={() => setAlertMessage('')} />
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control name="name" value={formData.name || ''} onChange={handleFormChange} disabled={!isEditing} /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>CUIT</Form.Label><Form.Control name="cuit" value={formData.cuit || ''} onChange={handleFormChange} disabled={!isEditing} /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control name="email" type="email" value={formData.email || ''} onChange={handleFormChange} disabled={!isEditing} /></Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3"><Form.Label>Teléfono</Form.Label><Form.Control name="phone" value={formData.phone || ''} onChange={handleFormChange} disabled={!isEditing} /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Dirección</Form.Label><Form.Control name="address" value={formData.address || ''} onChange={handleFormChange} disabled={!isEditing} /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Fecha de Registro</Form.Label><Form.Control value={company.registration_date ? new Date(company.registration_date).toLocaleDateString() : 'N/A'} disabled /></Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
                {isEditing && (
                    <Card.Footer className="d-flex justify-content-end gap-2 border-0 bg-white">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSaveChanges}>Guardar Cambios</Button>
                    </Card.Footer>
                )}
            </Card>
        </Container>
    );
};

export default CompanyProfile;
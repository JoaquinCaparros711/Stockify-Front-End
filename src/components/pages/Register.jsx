import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import Logo from '../../assets/Logo.png';
import { 
    BsPerson, 
    BsEnvelope, 
    BsShieldLock, 
    BsBuilding, 
    BsKey,
    BsFileEarmarkText,
    BsTelephone,
    BsGeoAlt,
    BsXCircleFill,
    BsCheckCircleFill // Ícono para éxito
} from 'react-icons/bs';
import { motion } from 'framer-motion';

// --- Componente para la Alerta (Error / Éxito) ---
const AppleStyleAlert = ({ type = "error", message, onClose }) => {
    if (!message) return null;

    const isSuccess = type === "success";

    return (
        <motion.div 
            className={`apple-style-alert ${isSuccess ? "success" : "error"}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            {isSuccess ? (
                <BsCheckCircleFill className="alert-icon success-icon" />
            ) : (
                <BsXCircleFill className="alert-icon error-icon" />
            )}
            <span>{message}</span>
            <button onClick={onClose} className="close-alert-btn">&times;</button>
        </motion.div>
    );
};

// --- Función de Ayuda para Validar los Campos ---
const validateField = (name, value, { password = '', users = [], companies = [] }) => {
    if (!value) return 'Este campo es obligatorio.';

    switch (name) {
        case 'name':
            return /\d/.test(value) ? 'El nombre no debe contener números.' : '';
        case 'username':
            return users.some(user => user.username === value) ? 'Este nombre de usuario ya está en uso.' : '';
        case 'email':
            if (users.some(user => user.email === value)) return 'Este email ya está registrado.';
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'El formato del email es inválido.';
        case 'password':
            if (value.length < 8) return 'Debe tener al menos 8 caracteres.';
            if (!/[A-Z]/.test(value)) return 'Debe contener al menos una mayúscula.';
            if (!/\d/.test(value)) return 'Debe contener al menos un número.';
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Debe contener al menos un símbolo.';
            return '';
        case 'confirmPassword':
            return value !== password ? 'Las contraseñas no coinciden.' : '';
        case 'companyName':
            return companies.some(company => company.name === value) ? 'Ya existe una empresa con este nombre.' : '';
        case 'companyCuit':
            if (!/^\d+$/.test(value)) return 'El CUIT solo debe contener números.';
            if (value.length !== 11) return 'El CUIT debe tener exactamente 11 dígitos.';
            return '';
        case 'companyEmail':
            if (companies.some(company => company.email === value)) return 'Este email de empresa ya está registrado.';
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'El formato del email es inválido.';
        case 'companyPhone':
            return /^\d+$/.test(value) ? '' : 'El teléfono solo debe contener números.';
        default:
            return '';
    }
};

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', username: '', password: '', confirmPassword: '',
        companyName: '', companyCuit: '', companyEmail: '', companyPhone: '', companyAddress: '',
    });
    
    const [errors, setErrors] = useState({});
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('error'); // 🔹 "error" o "success"
    
    const { register, users = [], companies = [] } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (alertMessage) setAlertMessage('');

        const error = validateField(name, value, { 
            password: formData.password, 
            users: users, 
            companies: companies 
        });
        setErrors({ ...errors, [name]: error });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const finalErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key], {
                password: formData.password,
                users: users,
                companies: companies
            });
            if (error) finalErrors[key] = error;
        });

        setErrors(finalErrors);

        if (Object.keys(finalErrors).length > 0) {
            setAlertType("error");
            setAlertMessage('Por favor, corrige los errores marcados en el formulario.');
            return;
        }
        
        register(formData);

        // ✅ Mensaje de éxito
        setAlertType("success");
        setAlertMessage("¡Tu cuenta se creó correctamente!");
        
        // Opcional: limpiar el formulario
        setFormData({
            name: '', email: '', username: '', password: '', confirmPassword: '',
            companyName: '', companyCuit: '', companyEmail: '', companyPhone: '', companyAddress: '',
        });
    };

    return (
        <div className="auth-container">
            <motion.div 
                className="auth-panel form-panel"
                initial={{ x: '-100vw' }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            >
                <motion.form 
                    className="auth-form" 
                    onSubmit={handleSubmit} 
                    noValidate
                >
                    <motion.h2 className="auth-title">Crear tu cuenta</motion.h2>

                    {/* 🔹 Alerta de error o éxito */}
                    <AppleStyleAlert 
                        type={alertType} 
                        message={alertMessage} 
                        onClose={() => setAlertMessage('')} 
                    />
                    
                    <motion.h5 className="text-muted mb-3 text-start">Datos del Administrador</motion.h5>
                    
                    <div className="input-group-custom">
                        <BsPerson className="icon" />
                        <input type="text" name="name" className="form-control" placeholder="Nombre y Apellido" onChange={handleChange} required />
                    </div>
                    {errors.name && <p className="text-danger small ms-2 text-start">{errors.name}</p>}

                    <div className="input-group-custom">
                        <BsEnvelope className="icon" />
                        <input type="email" name="email" className="form-control" placeholder="E-mail de contacto" onChange={handleChange} required />
                    </div>
                    {errors.email && <p className="text-danger small ms-2 text-start">{errors.email}</p>}
                    
                    <div className="input-group-custom">
                        <BsPerson className="icon" />
                        <input type="text" name="username" className="form-control" placeholder="Usuario" onChange={handleChange} required />
                    </div>
                    {errors.username && <p className="text-danger small ms-2 text-start">{errors.username}</p>}
                    
                    <div className="input-group-custom">
                        <BsShieldLock className="icon" />
                        <input type="password" name="password" className="form-control" placeholder="Contraseña" onChange={handleChange} required />
                    </div>
                    {errors.password && <p className="text-danger small ms-2 text-start">{errors.password}</p>}
                    
                    <div className="input-group-custom">
                        <BsKey className="icon" />
                        <input type="password" name="confirmPassword" className="form-control" placeholder="Repetir Contraseña" onChange={handleChange} required />
                    </div>
                    {errors.confirmPassword && <p className="text-danger small ms-2 text-start">{errors.confirmPassword}</p>}
                    
                    <motion.hr className="my-4" />
                    
                    <motion.h5 className="text-muted mb-3 text-start">Datos de tu Empresa</motion.h5>
                    
                    <div className="input-group-custom">
                        <BsBuilding className="icon" />
                        <input type="text" name="companyName" className="form-control" placeholder="Nombre de la Empresa" onChange={handleChange} required />
                    </div>
                    {errors.companyName && <p className="text-danger small ms-2 text-start">{errors.companyName}</p>}

                    <div className="input-group-custom">
                        <BsFileEarmarkText className="icon" />
                        <input type="text" name="companyCuit" className="form-control" placeholder="CUIT (11 dígitos sin guiones)" onChange={handleChange} required />
                    </div>
                    {errors.companyCuit && <p className="text-danger small ms-2 text-start">{errors.companyCuit}</p>}

                    <div className="input-group-custom">
                        <BsEnvelope className="icon" />
                        <input type="email" name="companyEmail" className="form-control" placeholder="E-mail de la Empresa" onChange={handleChange} required />
                    </div>
                    {errors.companyEmail && <p className="text-danger small ms-2 text-start">{errors.companyEmail}</p>}
                    
                    <div className="input-group-custom">
                        <BsTelephone className="icon" />
                        <input type="text" name="companyPhone" className="form-control" placeholder="Teléfono" onChange={handleChange} required />
                    </div>
                    {errors.companyPhone && <p className="text-danger small ms-2 text-start">{errors.companyPhone}</p>}
                    
                    <div className="input-group-custom">
                        <BsGeoAlt className="icon" />
                        <input type="text" name="companyAddress" className="form-control" placeholder="Dirección" onChange={handleChange} required />
                    </div>
                    {errors.companyAddress && <p className="text-danger small ms-2 text-start">{errors.companyAddress}</p>}

                    <motion.button 
                        type="submit" 
                        className="btn btn-primary btn-auth mt-3"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        CREAR CUENTA
                    </motion.button>
                </motion.form>
            </motion.div>
            <motion.div 
                className="auth-panel info-panel"
                initial={{ x: '100vw' }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            >
                <img src={Logo} alt="Logo de Stockify" />
                <h2 className="auth-title">¿Ya tenés cuenta?</h2>
                <p className="auth-subtitle">Inicia sesión con tus datos.</p>
                <Link to="/login" className="btn btn-outline-light">
                    INICIAR SESIÓN
                </Link>
            </motion.div>
        </div>
    );
};

export default Register;

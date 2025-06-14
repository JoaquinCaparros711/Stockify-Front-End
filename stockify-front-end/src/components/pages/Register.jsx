import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Asegúrate de que la ruta sea correcta
import './Auth.css';
import Logo from '../../assets/Logo.png'; // Asegúrate de que la ruta sea correcta
import { 
    BsPerson, 
    BsEnvelope, 
    BsShieldLock, 
    BsBuilding, 
    BsKey,
    BsFileEarmarkText,
    BsTelephone,
    BsGeoAlt
} from 'react-icons/bs';

const Register = () => {
    // 2. AÑADIMOS TODOS LOS CAMPOS DE LA EMPRESA AL ESTADO
    const [formData, setFormData] = useState({
        // Datos del Usuario Admin
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        // Datos de la Empresa
        companyName: '',
        companyCuit: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
    });
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        register(formData);
    };

    return (
        <div className="auth-container">
            <div className="auth-panel form-panel">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 className="auth-title">Crear tu cuenta</h2>
                    
                    <h5 className="text-muted mb-3 text-start">Datos del Administrador</h5>
                    <div className="input-group-custom">
                        <BsPerson className="icon" />
                        <input type="text" name="name" className="form-control" placeholder="Nombre y Apellido" onChange={handleChange} required />
                    </div>
                    <div className="input-group-custom">
                        <BsEnvelope className="icon" />
                        <input type="email" name="email" className="form-control" placeholder="E-mail de contacto" onChange={handleChange} required />
                    </div>
                    <div className="input-group-custom">
                        <BsPerson className="icon" />
                        <input type="text" name="username" className="form-control" placeholder="Usuario" onChange={handleChange} required />
                    </div>
                    <div className="input-group-custom">
                        <BsShieldLock className="icon" />
                        <input type="password" name="password" className="form-control" placeholder="Contraseña" onChange={handleChange} required />
                    </div>
                    <div className="input-group-custom">
                        <BsKey className="icon" />
                        <input type="password" name="confirmPassword" className="form-control" placeholder="Repetir Contraseña" onChange={handleChange} required />
                    </div>
                    
                    <hr className="my-4" />
                    
                    <h5 className="text-muted mb-3 text-start">Datos de tu Empresa</h5>
                    {/* 3. AÑADIMOS LOS INPUTS PARA LOS DATOS DE LA EMPRESA */}
                    <div className="input-group-custom">
                        <BsBuilding className="icon" />
                        <input type="text" name="companyName" className="form-control" placeholder="Nombre de la Empresa" onChange={handleChange} required />
                    </div>
                    <div className="input-group-custom">
                        <BsFileEarmarkText className="icon" />
                        <input type="text" name="companyCuit" className="form-control" placeholder="CUIT" onChange={handleChange} required />
                    </div>
                    <div className="input-group-custom">
                        <BsEnvelope className="icon" />
                        <input type="email" name="companyEmail" className="form-control" placeholder="E-mail de la Empresa" onChange={handleChange} required />
                    </div>
                    <div className="input-group-custom">
                        <BsTelephone className="icon" />
                        <input type="text" name="companyPhone" className="form-control" placeholder="Teléfono" onChange={handleChange} required />
                    </div>
                    <div className="input-group-custom">
                        <BsGeoAlt className="icon" />
                        <input type="text" name="companyAddress" className="form-control" placeholder="Dirección" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-auth mt-3">
                        CREAR CUENTA
                    </button>
                </form>
            </div>
            <div className="auth-panel info-panel">
                <img src={Logo} alt="Logo de Stockify" />
                <h2 className="auth-title">¿Ya tenés cuenta?</h2>
                <p className="auth-subtitle">Si ya te has registrado, inicia sesión con tus datos.</p>
                <Link to="/login" className="btn btn-outline-light">
                    INICIAR SESIÓN
                </Link>
            </div>
        </div>
    );
};

export default Register;
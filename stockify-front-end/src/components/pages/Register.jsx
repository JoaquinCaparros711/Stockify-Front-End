import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import Logo from '../../assets/Logo.png'


const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
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
            <div className="auth-panel info-panel">
                <img src={Logo} alt="" />
                <h2>¿Ya tenés cuenta?</h2>
                <p>Si ya tienes cuenta, inicia sesión.</p>
                <Link to="/login" className="btn btn-outline-light">
                    INICIAR SESIÓN
                </Link>
            </div>
            <div className="auth-panel form-panel">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2>Registrarse</h2>
                    <input type="text" name="name" className="form-control" placeholder="Nombre y Apellido" onChange={handleChange} />
                    <input type="email" name="email" className="form-control" placeholder="E-mail" onChange={handleChange} />
                    <input type="text" name="username" className="form-control" placeholder="Usuario" onChange={handleChange} />
                    <input type="password" name="password" className="form-control" placeholder="Contraseña" onChange={handleChange} />
                    <input type="password" name="confirmPassword" className="form-control" placeholder="Repetir Contraseña" onChange={handleChange} />
                    <button type="submit" className="btn btn-primary btn-auth">
                        REGISTRAR
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
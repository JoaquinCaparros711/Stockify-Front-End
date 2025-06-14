import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import Logo from '../../assets/Logo.png'
import { BsPerson, BsLock } from 'react-icons/bs'; // Importamos íconos

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        login({ username, password });
    };

    return (
        <div className="auth-container">
            <div className="auth-panel info-panel">
                <img src={Logo} alt="Logo de Stockify" />
                <h2 className="auth-title">¿No tenés cuenta?</h2>
                <p className="auth-subtitle">Creá una cuenta nueva para poder utilizar el programa de stock. Probalo GRATIS.</p>
                <Link to="/register" className="btn btn-outline-light">REGISTRARSE</Link>
            </div>
            <div className="auth-panel form-panel">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 className="auth-title">Iniciar sesión</h2>
                    
                    <div className="input-group-custom">
                        <BsPerson className="icon" />
                        <input type="text" className="form-control" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    
                    <div className="input-group-custom">
                        <BsLock className="icon" />
                        <input type="password" className="form-control" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-auth mt-3">ENTRAR</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
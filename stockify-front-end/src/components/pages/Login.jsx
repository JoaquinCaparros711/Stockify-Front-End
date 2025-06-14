import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import Logo from '../../assets/Logo.png'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !password) {
            alert('Por favor, completa ambos campos');
            return;
        }
        login({ username, password });
    };

    return (
        <div className="auth-container">
            <div className="auth-panel info-panel">
                <img src={Logo} alt="" />
                <h2>¿No tenés cuenta?</h2>
                <p>Creá una cuenta nueva para poder utilizar el programa de stock. Probalo GRATIS.</p>
                <Link to="/register" className="btn btn-outline-light">
                    REGISTRARSE
                </Link>
            </div>
            <div className="auth-panel form-panel">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2>Iniciar sesión</h2>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input 
                        type="password" 
                        className="form-control" 
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-auth">
                        ENTRAR
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
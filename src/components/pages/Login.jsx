import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import Logo from '../../assets/Logo.png';
import { BsPerson, BsLock, BsXCircleFill } from 'react-icons/bs';
import { motion } from 'framer-motion';

// --- Componente de Alerta ---
const AppleStyleAlert = ({ message }) => {
    if (!message) return null;
    return (
        <motion.div 
            className="apple-style-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <BsXCircleFill className="alert-icon" />
            <span>{message}</span>
        </motion.div>
    );
};

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (errorMessage) {
            setErrorMessage('');
        }
    };

    // --- Lógica para ATRApar el error ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            await login({ username, password });
            // Si el login es exitoso, el AuthContext redirige.
        } catch (error) {
            // Si el login falla, el 'throw' del context es atrapado aquí.
            setErrorMessage('Usuario o contraseña incorrectos.');
        }
    };
    
    // ... (variantes de animación sin cambios)
    const formVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 },
        },
    };

    return (
        <div className="auth-container">
            <motion.div 
                className="auth-panel info-panel"
                initial={{ x: '-100vw' }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            >
                <img src={Logo} alt="Logo de Stockify" />
                <h2 className="auth-title">¿No tenés cuenta?</h2>
                <p className="auth-subtitle">Creá una cuenta nueva para poder utilizar <b>Stockify</b> Probalo <b>GRATIS</b>.</p>
                <Link to="/register" className="btn btn-outline-light">REGISTRARSE</Link>
            </motion.div>

            <div className="auth-panel form-panel">
                <motion.form 
                    className="auth-form" 
                    onSubmit={handleSubmit}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h2 className="auth-title" variants={itemVariants}>Iniciar sesión</motion.h2>
                    
                    <AppleStyleAlert message={errorMessage} />
                    
                    <motion.div className="input-group-custom" variants={itemVariants}>
                        <BsPerson className="icon" />
                        <input type="text" className="form-control" placeholder="Usuario" value={username} onChange={handleInputChange(setUsername)} required />
                    </motion.div>
                    
                    <motion.div className="input-group-custom" variants={itemVariants}>
                        <BsLock className="icon" />
                        <input type="password" className="form-control" placeholder="Contraseña" value={password} onChange={handleInputChange(setPassword)} required />
                    </motion.div>

                    <motion.button 
                        type="submit" 
                        className="btn btn-primary btn-auth mt-3" 
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ENTRAR
                    </motion.button>
                </motion.form>
            </div>
        </div>
    );
};

export default Login;
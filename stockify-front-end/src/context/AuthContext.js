import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('accessToken');
        try {
            return token ? jwtDecode(token) : null;
        } catch (error) {
            console.error("Token inicial inválido:", error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return null;
        }
    });

    const login = async (data) => {
        try {
            const response = await api.post('/user/login/', {
                username: data.username,
                password: data.password
            });
            
            const { access, refresh } = response.data;

            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            const decodedUser = jwtDecode(access);

            setUser(decodedUser);
            navigate('/');

        } catch (error) {
            console.error("Error en el login:", error.response?.data);
            alert("Error: " + (error.response?.data?.detail || "Usuario o contraseña incorrectos."));
        }
    };

    // FUNCIÓN DE REGISTRO CON EL PAYLOAD CORRECTO
    const register = async (formData) => {
        try {
            // Hacemos la petición POST al endpoint de registro
            // con la estructura de datos anidada que espera el serializador.
            const response = await api.post('/user/register/', {
                // Datos del usuario (nivel superior)
                username: formData.username,
                password: formData.password,
                password2: formData.confirmPassword, // El serializador espera 'password2'
                email: formData.email,
                name: formData.name,
                
                // Objeto anidado 'company'
                company: {
                    name: formData.companyName,
                    cuit: formData.companyCuit,
                    email: formData.companyEmail,
                    phone: formData.companyPhone,
                    address: formData.companyAddress,
                }
            });

            console.log("Registro exitoso:", response.data);
            alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
            navigate('/login');

        } catch (error) {
            console.error("Error en el registro:", error.response?.data);
            const errorData = error.response?.data;
            let errorMessage = "Ocurrió un error en el registro.";
            if (errorData) {
                // Formateamos los errores para que sean más legibles
                errorMessage = Object.keys(errorData)
                    .map(key => {
                        // Si el error está en el objeto 'company', lo mostramos
                        if (key === 'company' && typeof errorData[key] === 'object') {
                            return Object.keys(errorData[key])
                                .map(companyKey => `Empresa - ${companyKey}: ${errorData[key][companyKey]}`)
                                .join('\n');
                        }
                        return `${key}: ${errorData[key]}`;
                    })
                    .join('\n');
            }
            alert(errorMessage);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const value = {
        user,
        login,
        logout,
        register,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};

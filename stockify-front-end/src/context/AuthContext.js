import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // SIMULACIÓN DE TABLAS DE LA BASE DE DATOS
    const [users, setUsers] = useState([
        { id: 1, username: 'joaco', password: '123', name: 'Joaquín (Admin)', role: 'admin', branch: null, companyId: 1 },
    ]);
    const [companies, setCompanies] = useState([
        { id: 1, name: 'Empresa de Prueba', cuit: '30-11223344-5', email: 'empresa@test.com', phone: '261123456', address: 'Av. Test 123' }
    ]);


    const login = (data) => {
        const foundUser = users.find(
            (u) => u.username === data.username && u.password === data.password
        );

        if (foundUser) {
            // AHORA GUARDAMOS MÁS DATOS DEL USUARIO AL HACER LOGIN
            const userData = { 
                username: foundUser.username, 
                name: foundUser.name,
                role: foundUser.role,      // <-- Importante para la lógica de roles
                branch: foundUser.branch,    // <-- Importante para la lógica de roles
                companyId: foundUser.companyId
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            navigate('/');
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    };

    // FUNCIÓN DE REGISTRO COMPLETAMENTE ACTUALIZADA
    const register = (formData) => {
        const userExists = users.some((u) => u.username === formData.username);
        if (userExists) {
            alert('El nombre de usuario ya existe');
            return;
        }

        // 1. Creamos la nueva empresa con los datos del formulario
        const newCompany = {
            id: Date.now(),
            name: formData.companyName,
            cuit: formData.companyCuit,
            email: formData.companyEmail,
            phone: formData.companyPhone,
            address: formData.companyAddress,
        };
        // La "guardamos" en nuestro estado que simula la base de datos
        setCompanies(prevCompanies => [...prevCompanies, newCompany]);
        console.log("EMPRESA CREADA:", newCompany);

        // 2. Creamos el nuevo usuario admin
        const newUser = {
            id: Date.now() + 1,
            name: formData.name,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: 'admin', // Como dijiste, el que se registra es siempre admin
            branch: null, // Los admins no pertenecen a una sucursal específica
            companyId: newCompany.id // Lo asociamos a la empresa recién creada
        };
        // Lo "guardamos" en nuestro estado de usuarios
        setUsers(prevUsers => [...prevUsers, newUser]);
        console.log("USUARIO ADMIN CREADO:", newUser);

        alert(`¡Cuenta para la empresa '${newCompany.name}' creada con éxito! Ahora puedes iniciar sesión.`);
        navigate('/login');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
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
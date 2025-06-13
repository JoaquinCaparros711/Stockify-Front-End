import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    
    // 3. Al cargar, intentamos leer el usuario del localStorage.
    // Usamos una función para que esto se ejecute solo una vez.
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        // Si encontramos un usuario en localStorage, lo usamos como estado inicial.
        // JSON.parse() convierte el texto guardado de nuevo en un objeto.
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [users, setUsers] = useState([
        { username: 'joaco', password: '123', name: 'Joaquín' }
    ]);

    const login = (data) => {
        const foundUser = users.find(
            (u) => u.username === data.username && u.password === data.password
        );

        if (foundUser) {
            const userData = { username: foundUser.username, name: foundUser.name };
            setUser(userData);
            
            // 1. Almacenamos el usuario en localStorage.
            // JSON.stringify() convierte el objeto de usuario en un texto para poder guardarlo.
            localStorage.setItem('user', JSON.stringify(userData));

            navigate('/');
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    };

    const register = (data) => {
        const userExists = users.some((u) => u.username === data.username);
        if (userExists) {
            alert('El nombre de usuario ya existe');
            return;
        }
        setUsers([...users, data]);
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        navigate('/login');
    };

    const logout = () => {
        setUser(null);

        // 2. Limpiamos localStorage al cerrar sesión.
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
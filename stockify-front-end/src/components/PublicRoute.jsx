import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const PublicRoute = () => {
    const { user } = useAuth();

    // Si el usuario existe (está logueado), lo redirigimos a la página de inicio.
    if (user) {
        return <Navigate to="/" />;
    }

    // Si no hay usuario, permitimos que se renderice el componente de la ruta (Login o Register).
    // <Outlet /> renderizará el componente hijo definido en App.js.
    return <Outlet />;
};

export default PublicRoute;

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SideBar from '../components/SideBar'; // Solo importamos el SideBar

const ProtectedRoute = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    // El layout ahora es más simple, sin el NavBar
    return (
        <div className="app-container">
            <SideBar />
            <div className="main-content">
                <main className="content-area">
                    <Outlet /> {/* Aquí se renderizarán Home, Products, etc. */}
                </main>
            </div>
        </div>
    );
};

export default ProtectedRoute;
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

// 1. Creamos el contexto
const DataContext = createContext(null);

// 2. Creamos el Proveedor del contexto, que contendrá toda la lógica
export const DataProvider = ({ children }) => {
    const { user } = useAuth(); // Obtenemos el usuario para saber si debemos pedir datos

    // --- ESTADOS GLOBALES PARA TODA LA APLICACIÓN ---
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [branchStock, setBranchStock] = useState([]);
    const [branches, setBranches] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false); // Para mostrar spinners de carga

    // --- LÓGICA DE API (FUNCIONES ASYNC) ---

    const fetchProducts = async () => {
        try {
            const response = await api.get('/control/model/product/');
            setProducts(response.data);
        } catch (error) { console.error("Error al cargar productos:", error); }
    };
    
    const addProduct = async (productData) => {
        try {
            const response = await api.post('/control/model/product/', productData);
            await fetchProducts(); // Volvemos a pedir los datos para tener la lista actualizada
            alert('¡Producto creado con éxito!');
        } catch (error) {
            console.error("Error al crear el producto:", error.response?.data);
            alert("Error al crear producto: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const updateProduct = async (productId, productData) => {
        try {
            await api.put(`/control/model/product/${productId}/`, productData);
            await fetchProducts();
            alert('¡Producto actualizado con éxito!');
        } catch (error) {
            console.error("Error al actualizar el producto:", error.response?.data);
            alert("Error al actualizar producto: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };
    
    const deleteProduct = async (productId) => {
        try {
            await api.delete(`/control/model/product/${productId}/`);
            await fetchProducts();
            alert('Producto eliminado con éxito.');
        } catch (error) {
            console.error("Error al eliminar el producto:", error.response?.data);
            alert("Error al eliminar producto: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const fetchMovements = async () => {
        try {
            const response = await api.get('/control/model/stock_movement/');
            setMovements(response.data);
        } catch (error) { console.error("Error al cargar movimientos:", error); }
    };

    const addMovement = async (movementData) => {
        try {
            await api.post('/control/model/stock_movement/', movementData);
            // Después de un movimiento, el stock y la lista de movimientos cambian
            await Promise.all([fetchMovements(), fetchBranchStock()]);
            alert('Movimiento registrado con éxito.');
        } catch (error) {
            console.error("Error al registrar movimiento:", error.response?.data);
            alert("Error al registrar movimiento: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };
    
    // --- LÓGICA DE API PARA SUCURSALES Y USUARIOS ---
    const fetchBranches = async () => {
        try {
            const response = await api.get('/control/model/branch/');
            setBranches(response.data);
        } catch (error) { console.error("Error al cargar sucursales:", error); }
    };

    // --- FUNCIONES CRUD PARA SUCURSALES (AÑADIDAS) ---
    const addBranch = async (branchData) => {
        try {
            await api.post('/control/model/branch/', branchData);
            await fetchBranches(); // Refrescamos la lista para mostrar la nueva sucursal
            alert('¡Sucursal creada con éxito!');
        } catch (error) {
            console.error("Error al crear la sucursal:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error; // Lanzamos el error para que el componente lo maneje
        }
    };

    const updateBranch = async (branchId, branchData) => {
        try {
            await api.put(`/control/model/branch/${branchId}/`, branchData);
            await fetchBranches(); // Refrescamos la lista
            alert('¡Sucursal actualizada con éxito!');
        } catch (error) {
            console.error("Error al actualizar la sucursal:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const deleteBranch = async (branchId) => {
        try {
            await api.delete(`/control/model/branch/${branchId}/`);
            await fetchBranches(); // Refrescamos la lista
            alert('Sucursal eliminada con éxito.');
        } catch (error) {
            console.error("Error al eliminar la sucursal:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };
    
    const fetchUsers = async () => {
        try {
            // La ruta correcta para listar usuarios es /user/, no /user/register/
            const response = await api.get('/user/register/');
            setUsers(response.data);
        } catch (error) { console.error("Error al cargar usuarios:", error); }
    };

    const fetchBranchStock = async () => {
        try {
            const response = await api.get('/control/model/branch_stock/');
            setBranchStock(response.data);
        } catch (error) { console.error("Error al cargar el stock:", error); }
    };

    // --- FUNCIONES CRUD PARA STOCK ---
    const addBranchStock = async (stockData) => {
        try {
            await api.post('/control/model/branch_stock/', stockData);
            await fetchBranchStock(); // Refrescamos la lista de stock
            alert('Producto ingresado al stock con éxito.');
        } catch (error) {
            console.error("Error al ingresar producto al stock:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const adjustStock = async (stockId, stockData) => {
        try {
            // Usamos PATCH para actualizar solo los campos que enviamos (current_stock)
            await api.patch(`/control/model/branch_stock/${stockId}/`, stockData);
            await fetchBranchStock(); // Refrescamos la lista de stock
            // También refrescamos los movimientos para registrar el ajuste si lo implementas
            await fetchMovements(); 
            alert('Stock ajustado con éxito.');
        } catch (error) {
            console.error("Error al ajustar el stock:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };


    // Efecto para cargar todos los datos cuando el usuario inicia sesión
    useEffect(() => {
        const loadAllData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                await Promise.all([
                    fetchProducts(),
                    fetchMovements(),
                    fetchBranchStock(),
                    fetchBranches(),
                    fetchUsers()
                ]);
            } catch (error) {
                console.error("Fallo al cargar todos los datos iniciales", error);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, [user]);

    const addUserByAdmin = async (userData) => {
        try {
            // Usamos el endpoint específico que creaste para esta acción
            await api.post('/user/admin/create-user/', userData);
            await fetchUsers(); // Refrescamos la lista
            alert('¡Usuario creado con éxito!');
        } catch (error) {
            console.error("Error al crear el usuario:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const updateUser = async (userId, userData) => {
        try {
            // Usamos PATCH para permitir actualizaciones parciales (ej: no cambiar la contraseña)
            await api.patch(`/user/register/${userId}/`, userData);
            await fetchUsers(); // Refrescamos la lista
            alert('¡Usuario actualizado con éxito!');
        } catch (error) {
            console.error("Error al actualizar el usuario:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const deleteUser = async (userId) => {
        try {
            await api.delete(`/user/register/${userId}/`);
            await fetchUsers(); // Refrescamos la lista
            alert('Usuario eliminado con éxito.');
        } catch (error) {
            console.error("Error al eliminar el usuario:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    // El valor que se proveerá a toda la aplicación
    const value = {
        products,
        movements,
        branchStock,
        branches,
        users,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addMovement,
        addBranch, 
        updateBranch, 
        deleteBranch,
        addBranchStock, 
        adjustStock,
        addUserByAdmin, 
        updateUser, 
        deleteUser,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// 3. Hook personalizado para consumir el contexto fácilmente
export const useData = () => {
    return useContext(DataContext);
};

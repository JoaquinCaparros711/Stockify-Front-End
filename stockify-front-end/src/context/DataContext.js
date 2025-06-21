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

    const fetchBranchStock = async () => {
        try {
            const response = await api.get('/control/model/branch_stock/');
            setBranchStock(response.data);
        } catch (error) { console.error("Error al cargar el stock:", error); }
    };
    
    // --- LÓGICA DE API PARA SUCURSALES Y USUARIOS ---
    const fetchBranches = async () => {
        try {
            const response = await api.get('/control/model/branch/');
            setBranches(response.data);
        } catch (error) { console.error("Error al cargar sucursales:", error); }
    };
    
    const fetchUsers = async () => {
        try {
            // La ruta correcta para listar usuarios es /user/, no /user/register/
            const response = await api.get('/user/register/');
            setUsers(response.data);
        } catch (error) { console.error("Error al cargar usuarios:", error); }
    };

    // Efecto para cargar todos los datos cuando el usuario inicia sesión
    useEffect(() => {
        const loadAllData = async () => {
            if (!user) return; // Si no hay usuario, no hacemos nada
            
            setLoading(true);
            try {
                // Hacemos todas las peticiones en paralelo para mayor eficiencia
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
    }, [user]); // Este efecto se ejecuta cada vez que el usuario cambia (login/logout)

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
        // Aquí podrías añadir 'adjustStock' si la implementas
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// 3. Hook personalizado para consumir el contexto fácilmente
export const useData = () => {
    return useContext(DataContext);
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

// Creamos el contexto
const DataContext = createContext(null);

// Creamos el Proveedor del contexto
export const DataProvider = ({ children }) => {
    const { user } = useAuth(); // Obtenemos el usuario para saber si debemos pedir datos

    // --- ESTADOS GLOBALES ---
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [branchStock, setBranchStock] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- LÓGICA DE API PARA PRODUCTOS ---
    const fetchProducts = async () => {
        try {
            // Usamos la URL correcta del backend
            const response = await api.get('/control/model/product/');
            setProducts(response.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };
    
    const addProduct = async (productData) => {
        try {
            const response = await api.post('/control/model/product/', productData);
            setProducts(prevProducts => [response.data, ...prevProducts]);
            alert('¡Producto creado con éxito!');
        } catch (error) {
            console.error("Error al crear el producto:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const updateProduct = async (productId, productData) => {
        try {
            const response = await api.put(`/control/model/product/${productId}/`, productData);
            setProducts(prevProducts => 
                prevProducts.map(p => (p.id === productId ? response.data : p))
            );
            alert('¡Producto actualizado con éxito!');
        } catch (error) {
            console.error("Error al actualizar el producto:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };
    
    const deleteProduct = async (productId) => {
        try {
            await api.delete(`/control/model/product/${productId}/`);
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            alert('Producto eliminado con éxito.');
        } catch (error) {
            console.error("Error al eliminar el producto:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    // --- LÓGICA DE API PARA MOVIMIENTOS (Añadida como base) ---
    const fetchMovements = async () => {
        try {
            const response = await api.get('/control/model/stock_movement/'); // Asumiendo esta URL
            setMovements(response.data);
        } catch (error) {
            console.error("Error al cargar movimientos:", error);
        }
    };

    const addMovement = async (movementData) => {
        try {
            const response = await api.post('/control/model/stock_movement/', movementData);
            // Actualizamos la lista de movimientos y el stock correspondiente
            fetchMovements();
            fetchBranchStock();
            alert('Movimiento registrado con éxito.');
        } catch (error) {
            console.error("Error al registrar movimiento:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    // --- LÓGICA DE API PARA STOCK (Añadida como base) ---
    const fetchBranchStock = async () => {
        try {
            const response = await api.get('/control/model/branch_stock/'); // Asumiendo esta URL
            setBranchStock(response.data);
        } catch (error) {
            console.error("Error al cargar el stock:", error);
        }
    };

    const adjustStock = async (stockId, newStockData) => {
        try {
            const response = await api.patch(`/control/model/branch_stock/${stockId}/`, newStockData);
            setBranchStock(prevStock => 
                prevStock.map(item => (item.id === stockId ? response.data : item))
            );
            alert('Stock ajustado con éxito.');
        } catch (error) {
            console.error("Error al ajustar el stock:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    // Efecto para cargar todos los datos iniciales cuando el usuario se loguea
    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            await Promise.all([
                fetchProducts(),
                fetchMovements(),
                fetchBranchStock()
            ]);
            setLoading(false);
        };

        if (user) {
            loadAllData();
        } else {
            // Si el usuario se desloguea, limpiamos los datos
            setProducts([]);
            setMovements([]);
            setBranchStock([]);
        }
    }, [user]);

    const value = {
        products,
        movements,
        branchStock,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addMovement,
        adjustStock,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    return useContext(DataContext);
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [branchStock, setBranchStock] = useState([]);
    const [branches, setBranches] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [company, setCompany] = useState(null);


    const fetchProducts = async () => {
        try {
            const response = await api.get('/control/model/product/');
            setProducts(response.data);
        } catch (error) { console.error("Error al cargar productos:", error); }
    };
    
    const addProduct = async (productData) => {
        try {
            await api.post('/control/model/product/', productData);
            await fetchProducts(); 
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
            await Promise.all([fetchMovements(), fetchBranchStock()]);
        } catch (error) {
            console.error("Error al registrar movimiento:", error.response?.data);
            alert("Error al registrar movimiento: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };
    
    const fetchBranches = async () => {
        try {
            const response = await api.get('/control/model/branch/');
            setBranches(response.data);
        } catch (error) { console.error("Error al cargar sucursales:", error); }
    };

    const addBranch = async (branchData) => {
        try {
            await api.post('/control/model/branch/', branchData);
            await fetchBranches(); 
        } catch (error) {
            console.error("Error al crear la sucursal:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error; 
        }
    };

    const updateBranch = async (branchId, branchData) => {
        try {
            await api.put(`/control/model/branch/${branchId}/`, branchData);
            await fetchBranches(); 
        } catch (error) {
            console.error("Error al actualizar la sucursal:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const deleteBranch = async (branchId) => {
        try {
            await api.delete(`/control/model/branch/${branchId}/`);
            await fetchBranches(); 
        } catch (error) {
            console.error("Error al eliminar la sucursal:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };
    
    const fetchUsers = async () => {
        try {
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

    const addBranchStock = async (stockData) => {
        try {
            await api.post('/control/model/branch_stock/', stockData);
            await fetchBranchStock(); 
        } catch (error) {
            console.error("Error al ingresar producto al stock:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const adjustStock = async (stockId, stockData) => {
        try {
            await api.patch(`/control/model/branch_stock/${stockId}/`, stockData);
            await fetchBranchStock(); 
            await fetchMovements(); 
        } catch (error) {
            console.error("Error al ajustar el stock:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };


    useEffect(() => {
        const loadAllData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const dataPromises = [
                    fetchProducts(),
                    fetchMovements(),
                    fetchBranchStock(),
                    fetchBranches(),
                    fetchUsers()
                ];
                
                if (user.role === 'admin') {
                    dataPromises.push(fetchCompany());
                }

                await Promise.all(dataPromises);

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
            await api.post('/user/admin/create-user/', userData);
            await fetchUsers(); 
        } catch (error) {
            console.error("Error al crear el usuario:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const updateUser = async (userId, userData) => {
        try {
            await api.patch(`/user/register/${userId}/`, userData);
            await fetchUsers();
        } catch (error) {
            console.error("Error al actualizar el usuario:", error.response?.data);
            throw error;
        }
    };

    const deleteUser = async (userId) => {
        try {
            await api.delete(`/user/register/${userId}/`);
            await fetchUsers(); 
        } catch (error) {
            console.error("Error al eliminar el usuario:", error.response?.data);
            alert("Error: " + JSON.stringify(error.response?.data));
            throw error;
        }
    };

    const fetchCompany = async () => {
        try {
            const response = await api.get(`/control/model/company/${user.company.id}/`);
            setCompany(response.data);
        } catch (error) {
            console.error("Error al cargar los datos de la empresa:", error);
        }
    };

    const updateCompany = async (companyId, companyData) => {
        try {
            const response = await api.put(`/control/model/company/${companyId}/`, companyData);
            setCompany(response.data); 
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error al actualizar la empresa:", error.response?.data);
            throw error;
        }
    };

    const value = {
        products,
        movements,
        branchStock,
        branches,
        users,
        loading,
        company,
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
        updateCompany,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    return useContext(DataContext);
};

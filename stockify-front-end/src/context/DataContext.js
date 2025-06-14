import React, { createContext, useState, useContext } from 'react';

// Datos iniciales de ejemplo
const mockMovementsData = [
    { id: 1, date: '2025-06-12T10:30:00Z', type: 'incoming', productName: 'Mate Imperial Calabaza', quantity: 20, branchName: 'Depósito Central', userName: 'joaco', description: 'Ingreso de proveedor' },
];
const mockBranchStockData = [
    { id: 1, productId: 1, productName: 'Mate Imperial Calabaza', category: 'Mate', branchId: 1, branchName: 'Depósito Central', current_stock: 30 },
];
const mockProductsData = [
    { id: 1, name: 'Mate Imperial Calabaza', description: 'Interior calabaza, forrado en cuero', price: 28000.00, category: 'Mates', estado: 'Activo' },
];

// Creamos el contexto
const DataContext = createContext(null);

// Creamos el Proveedor del contexto
export const DataProvider = ({ children }) => {
    const [movements, setMovements] = useState(mockMovementsData);
    const [branchStock, setBranchStock] = useState(mockBranchStockData);
    const [products, setProducts] = useState(mockProductsData); // Si quieres gestionar productos globalmente

    // Función para añadir un nuevo movimiento
    const addMovement = (movementData) => {
        const newMovement = {
            id: Date.now(),
            date: new Date().toISOString(),
            userName: 'joaco', // Esto debería venir del AuthContext en el futuro
            ...movementData,
        };

        // Añadimos el nuevo movimiento al principio de la lista
        setMovements(prevMovements => [newMovement, ...prevMovements]);

        // Si es una salida, ajustamos el stock
        if (movementData.type === 'outgoing') {
            adjustStock(movementData.productId, movementData.branchName, -movementData.quantity);
        }
        
        console.log("Nuevo movimiento registrado:", newMovement);
    };

    // Función para ajustar el stock de un producto en una sucursal
    const adjustStock = (productId, branchName, quantityChange) => {
        setBranchStock(prevStock => 
            prevStock.map(item => 
                (item.productId === productId && item.branchName === branchName)
                ? { ...item, current_stock: item.current_stock + quantityChange }
                : item
            )
        );
        console.log(`Stock ajustado para producto ${productId} en ${branchName}. Cambio: ${quantityChange}`);
    };


    const value = {
        movements,
        branchStock,
        products,
        addMovement,
        adjustStock,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Hook personalizado para usar el contexto fácilmente
export const useData = () => {
    return useContext(DataContext);
};

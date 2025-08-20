import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Pasamos 'products' como prop para poder buscar los nombres
const MovimientosChart = ({ movements = [], products = [] }) => {

    const chartData = useMemo(() => {
        const productMap = new Map(products.map(p => [p.id, p.name]));
        
        // Ahora guardaremos un array de movimientos por día
        const incomingByDate = new Map();
        const outgoingByDate = new Map();
        const labels = [];
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            // Usamos UTC para evitar problemas de zona horaria que desfasen el día
            const date = new Date(Date.UTC(currentYear, currentMonth, day));
            const dateKey = date.toISOString().split('T')[0];
            
            incomingByDate.set(dateKey, []); // Inicializamos con un array vacío
            outgoingByDate.set(dateKey, []); // Inicializamos con un array vacío
            labels.push(day.toString());
        }

        movements.forEach(mov => {
            const movementDate = new Date(mov.date);

            if (movementDate.getUTCFullYear() === currentYear && movementDate.getUTCMonth() === currentMonth) {
                const movementDateKey = new Date(Date.UTC(movementDate.getUTCFullYear(), movementDate.getUTCMonth(), movementDate.getUTCDate())).toISOString().split('T')[0];
                const quantity = parseInt(mov.quantity) || 0;
                const productName = productMap.get(mov.product) || 'Producto desconocido';

                const movementDetail = { productName, quantity };

                if (mov.movement_type === 'incoming' && incomingByDate.has(movementDateKey)) {
                    incomingByDate.get(movementDateKey).push(movementDetail);
                } else if (mov.movement_type === 'outgoing' && outgoingByDate.has(movementDateKey)) {
                    outgoingByDate.get(movementDateKey).push(movementDetail);
                }
            }
        });
        
        // Sumamos las cantidades totales para la altura de la barra
        const totalIncoming = Array.from(incomingByDate.values()).map(dayArray => dayArray.reduce((sum, item) => sum + item.quantity, 0));
        const totalOutgoing = Array.from(outgoingByDate.values()).map(dayArray => dayArray.reduce((sum, item) => sum + item.quantity, 0));

        return {
            labels,
            datasets: [
                {
                    label: 'Salidas',
                    data: totalOutgoing,
                    backgroundColor: '#ff3b30', // Rojo
                    borderColor: '#ff3b30',
                    borderWidth: 1,
                    borderRadius: 5,
                    barPercentage: 0.6,
                    // Guardamos los detalles en el dataset para usarlos en el tooltip
                    details: Array.from(outgoingByDate.values()),
                },
                {
                    label: 'Entradas',
                    data: totalIncoming,
                    backgroundColor: '#34c759', // Verde
                    borderColor: '#34c759',
                    borderWidth: 1,
                    borderRadius: 5,
                    barPercentage: 0.6,
                    details: Array.from(incomingByDate.values()),
                },
            ],
        };

    }, [movements, products]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: 'Movimientos del Mes Actual',
                font: { size: 18, family: 'system-ui, sans-serif', weight: 'bold' },
                padding: { top: 10, bottom: 20 }
            },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#333',
                bodyColor: '#333',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    // Función para personalizar el contenido del tooltip
                    label: function(context) {
                        const total = context.parsed.y;
                        if (total === 0) return null; // No mostrar tooltip si no hay movimientos

                        return `${context.dataset.label}: ${total} unidades`;
                    },
                    afterBody: function(context) {
                        // Esta función añade el detalle de los productos debajo de la línea principal
                        const datasetIndex = context[0].datasetIndex;
                        const dataIndex = context[0].dataIndex;
                        const details = chartData.datasets[datasetIndex].details[dataIndex];

                        if (details && details.length > 0) {
                            // Mapeamos cada movimiento a una línea de texto
                            return details.map(item => `  - ${item.productName}: ${item.quantity}`);
                        }
                        return '';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Cantidad de Unidades'
                }
            },
            x: {
                grid: { display: false }
            }
        }
    };
    
    return (
        <div style={{ height: '300px' }}>
            <Bar options={options} data={chartData} />
        </div>
    );
}

export default MovimientosChart;
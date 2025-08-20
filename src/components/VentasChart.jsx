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

// El componente ya no necesita la lista de 'products'
const VentasChart = ({ movements = [] }) => {

    const chartData = useMemo(() => {
        const salesByDate = new Map();
        const labels = [];

        // Inicializamos los últimos 7 días con 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split('T')[0];
            salesByDate.set(dateKey, 0);
            labels.push(d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''));
        }

        // Procesamos los movimientos de venta
        movements.forEach(mov => {
            const movementDateStr = mov.date; 

            if (mov.movement_type === 'outgoing' && movementDateStr) {
                const movementDateKey = new Date(movementDateStr).toISOString().split('T')[0];

                if (salesByDate.has(movementDateKey)) {
                    // --- 💡 CAMBIO CLAVE ---
                    // Usamos el precio que se guardó en el momento del movimiento
                    const price = parseFloat(mov.price_at_movement) || 0;
                    const saleValue = price * mov.quantity;
                    salesByDate.set(movementDateKey, salesByDate.get(movementDateKey) + saleValue);
                }
            }
        });
        
        return {
            labels,
            datasets: [
                {
                    label: 'Ventas ($)',
                    data: Array.from(salesByDate.values()),
                    backgroundColor: 'rgba(13, 110, 253, 0.8)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                    barPercentage: 0.6,
                },
            ],
        };

    }, [movements]); // Ya no depende de 'products'

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Ventas de los últimos 7 días',
                font: { size: 18, family: 'system-ui, sans-serif', weight: 'bold' },
                padding: { top: 10, bottom: 20 }
            },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#333',
                bodyColor: '#333',
                borderColor: '#ddd',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '$' + new Intl.NumberFormat('es-AR').format(value);
                    }
                }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return <Bar options={options} data={chartData} />;
}

export default VentasChart;
import React from 'react';
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

// El componente ahora recibe los movimientos y productos como props
const VentasChart = ({ movements = [], products = [] }) => {

    // --- LÓGICA PARA PROCESAR LOS DATOS ---

    // 1. Creamos las etiquetas para los últimos 7 días
    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // Formato simple como "Dom", "Lun", "Mar", etc.
        labels.push(d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''));
    }

    // 2. Inicializamos los datos de ventas para cada día en cero
    const salesData = Array(7).fill(0);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    // 3. Procesamos los movimientos
    movements.forEach(mov => {
        // Solo nos interesan las salidas ('outgoing')
        if (mov.movement_type === 'outgoing') {
            const movementDate = new Date(mov.date.replace(' ', 'T'));

            // Verificamos si el movimiento ocurrió en los últimos 7 días
            if (movementDate >= sevenDaysAgo && movementDate <= today) {
                // Encontramos el producto para obtener su precio
                const product = products.find(p => p.id === mov.product);
                if (product) {
                    const saleValue = (parseFloat(product.price) || 0) * mov.quantity;
                    
                    // Calculamos a qué día corresponde (0=hoy, 1=ayer, etc.)
                    const diffDays = Math.floor((today - movementDate) / (1000 * 60 * 60 * 24));
                    const dayIndex = 6 - diffDays; // Lo mapeamos a nuestro array de labels

                    if (dayIndex >= 0 && dayIndex < 7) {
                        salesData[dayIndex] += saleValue;
                    }
                }
            }
        }
    });

    // --- CONFIGURACIÓN DEL GRÁFICO ---

    const data = {
        labels,
        datasets: [
            {
                label: 'Ventas ($)',
                data: salesData, // Usamos los datos que calculamos
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderRadius: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Ventas de los últimos 7 días',
                font: {
                    size: 16
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return <Bar options={options} data={data} />;
}

export default VentasChart;

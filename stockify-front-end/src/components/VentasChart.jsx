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

const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const data = {
    labels,
    datasets: [
        {
        label: 'Ventas ($)',
        data: [12050, 19800, 8500, 21200, 15000, 25100, 18300], // Datos de ejemplo
        backgroundColor: '#ec9639',
        borderRadius: 5,
        },
    ],
};

const VentasChart = () => {
    return <Bar options={options} data={data} />;
}

export default VentasChart;
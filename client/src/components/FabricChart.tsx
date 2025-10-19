import React from 'react';
import style from './FabricChart.module.css';
import { 
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    plugins
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { mockFabricData } from './MockFabricData';
import { fabricInfo } from '../data/FabricInfo';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function FabricChart() {
    const labels = mockFabricData.materials.map((m) => m.material);
    const data = mockFabricData.materials.map((m) => m.percentage);

    const backgroundColors = labels.map( label => {
        const info = fabricInfo[label as keyof typeof fabricInfo];
        return info ? info.color: "#CCCCCC";
    });

    const chartData = {
        labels,
        datasets:[
            {
                data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderColor: "transparent",
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins : {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const label = context.label;
                        const value = context.raw;
                        const info = fabricInfo[label];
                        const description = info
                            ? ` : ${info.description}`
                            : "";
                        return `${label}: ${value}%${description}`;
                    },
                },
            },
        },
    };

    return (
        <div className={style.chartWrapper}>
            <Pie data={chartData} options={options} />
        </div>
      );
}

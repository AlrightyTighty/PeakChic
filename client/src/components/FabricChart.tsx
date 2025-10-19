import React from 'react';
import style from './FabricChart.module.css';
import { 
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    plugins,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { mockFabricData } from './MockFabricData';
import { fabricInfo } from '../data/FabricInfo';


ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
);

export default function FabricChart() {
    const labels = mockFabricData.materials.map((m) => m.material);
    const data = mockFabricData.materials.map((m) => m.percentage);

    console.log(data);

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
        layout: {
            padding: {
                top: 20,
                bottom: 20, 
                left: 20,
                right: 20 
            }
        },
        plugins : {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#FFF5F2",
                titleColor: "#57613E",
                bodyColor: "#727D55",
                padding: {
                    top: 16,
                    bottom: 12,
                    left:16,
                    right:15,
                },
                titleFont: {
                    family: "Junge, serif",
                    size: 16,
                    weight: "bold",
                },
                bodyFont:{
                    family: "Junge, serif",
                    size: 14,
                },
                cornerRadius: 20, 
                displayColors: false,
                callbacks: {
                    label: (context: any) => {
                        const label = context.label;
                        const value = context.raw;
                        const info = fabricInfo[label];
                        const description = info
                            ? `${info.description}`
                            : "";
                        return[
                            `${value}%`,
                            description
                        ];
                    },
                },
                bodySpacing: 6,
                boxPadding: 10,
                usePointStyle: true,
            },
        },
    } as const;

    return (
        <div className={style.chartWrapper}>
            <Pie data={chartData} options={options} />
        </div>
      );
}

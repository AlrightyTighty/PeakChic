import style from './FabricChart.module.css';
import { 
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { mockFabricData } from './MockFabricData';
import { fabricInfo } from '../data/FabricInfo';
import flowerPng from "../assets/Flower.png";

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

    const toList = (v: unknown): string[] =>
        Array.isArray(v)
          ? v.map(s => String(s).trim()).filter(Boolean)
          : typeof v === "string"
            ? v.split(",").map(s => s.trim()).filter(Boolean)
            : [];

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
                        const lines: string[] = [];

                        if (typeof value !== "undefined") lines.push(`${value}%`);
                        if (info?.description) lines.push(info.description);
            
                        const prosList = toList(info?.pros);
                        const consList = toList(info?.cons);
            
                        if (prosList.length) {
                          lines.push("Pros:");
                          lines.push(...prosList.map(p => `• ${p}`)); // one line per item
                        }
                        if (prosList.length && consList.length) lines.push(""); // spacer
                        if (consList.length) {
                          lines.push("Cons:");
                          lines.push(...consList.map(c => `• ${c}`)); // one line per item
                        }
            
                        return lines;
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
            <img src={flowerPng} alt="flower background" className={style.flowerBg} />
            <Pie data={chartData} options={options} />
        </div>
      );
}

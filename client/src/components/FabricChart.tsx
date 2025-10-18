import React from 'react';
import { 
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    plugins
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { mockFabricData } from './MockFabricData';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function FabricChart() {
    const labels = mockFabricData.fabricComposition.map(f => f.name);
    const data = mockFabricData.fabricComposition.map(f => f.percentage);

    const chartData = {
        labels,
        datasets:[
            {
                data,
                backgroundColor: ["#F66D44", "#FEAE65", "#E6F69D"]
            }
        ]
    };

    // what is record
    // what is point?
    const fabricInfo: Record<string, string> = {
        Cotton: "Natural, breathable, soft",
        Polyester: "Synthetic, sheds microplastics",
        Elastine: "Stretchy, retains shape",
    };

    // point of this?
    const options = {
        plugins : {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const label = context.label;
                        const value = context.raw;
                        return `${label}: ${value}% - ${fabricInfo[label] || ""}`;
                    },
                },
            },
            legend: {
                position: "bottom" as const,
            },
        },
    };

    // point of this bottom one?
    return (
        <div style={{ width: 300, margin: "0 auto", textAlign: "center" }}>
          <h3>Fabric Composition</h3>
          <Pie data={chartData} options={options} />
          <p style={{ fontSize: "0.9em", marginTop: "10px" }}>
            {mockFabricData.summary}
          </p>
        </div>
      );
}

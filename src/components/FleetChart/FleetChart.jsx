import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FleetChart() {
  const data = {
    labels: ["Available", "On Trip", "Maintenance"],
    datasets: [
      {
        data: [102, 38, 12],
        backgroundColor: ["#22C55E", "#3B82F6", "#F59E0B"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#f8fafc",
        },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
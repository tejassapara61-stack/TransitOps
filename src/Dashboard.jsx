import DashboardLayout from "./components/DashboardLayout";
import FleetChart from "./components/FleetChart/FleetChart";
import StatCard from "./components/StatCard/StatCard";
import TripChart from "./components/TripChart/TripChart";
import RecentTrips from "./components/RecentTrips.jsx/RecentTrips";

import {
  FaTruck,
  FaRoad,
  FaUserTie,
  FaTools,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa";


import "./Dashboard.css";

export default function Dashboard() {
  return (
    <DashboardLayout breadcrumb="Dashboard">
      <div className="dashboard">
        <div className="dashboard-header">

    <div className="welcome-section">
        <h1>Good Morning, Aditya 👋</h1>
        <p>Here's what's happening across your fleet today.</p>
    </div>

    <div className="quick-actions">

        <button className="action-btn">
            🚚 Vehicle
        </button>

        <button className="action-btn">
            🛣 Trip
        </button>

        <button className="action-btn">
            👤 Driver
        </button>

        <button className="action-btn">
            🛠 Maintenance
        </button>

    </div>

</div>

        <div className="dashboard-top">

          <StatCard
            title="Active Vehicles"
            value={156}
            change="+8 Today"
            icon={<FaTruck />}
            color="#3B82F6"
          />

          <StatCard
            title="Available Vehicles"
            value={102}
            change="Ready"
            icon={<FaCheckCircle />}
            color="#10B981"
          />

          <StatCard
            title="Active Trips"
            value={38}
            change="Running"
            icon={<FaRoad />}
            color="#8B5CF6"
          />

          <StatCard
            title="Drivers On Duty"
            value={87}
            change="Online"
            icon={<FaUserTie />}
            color="#F97316"
          />

          <StatCard
            title="Maintenance"
            value={12}
            change="In Shop"
            icon={<FaTools />}
            color="#EF4444"
          />

          <StatCard
            title="Fleet Utilization"
            value="84%"
            change="Excellent"
            icon={<FaChartLine />}
            color="#14B8A6"
          />

        </div>

        {/* Charts */}
        <div className="dashboard-middle">

          <div className="chart-box">

<h3>Fleet Utilization</h3>

<FleetChart />

</div>

          <div className="chart-box">
    <h3>Trip Status</h3>
    <TripChart />
</div>

        </div>

        {/* Table */}
        <div className="dashboard-bottom">

    <div className="table-box">
        <RecentTrips />
    </div>

    <div className="alert-box">

        <h3>License & Vehicle Alerts</h3>

        <ul className="alerts-list">

            <li>⚠ Rahul Sharma - Driving License expires in 5 days</li>

            <li>🚚 Truck-08 - Insurance expires in 9 days</li>

            <li>🛠 Van-05 - Service due tomorrow</li>

            <li>📄 Bus-12 - PUC expires in 3 days</li>

        </ul>

    </div>

</div>

      </div>
    </DashboardLayout>
  );
}
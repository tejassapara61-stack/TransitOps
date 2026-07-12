import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <DashboardLayout breadcrumb="Dashboard">
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Good Morning 👋</h1>
            <p>Here's what's happening across your fleet today.</p>
          </div>

          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate("/dashboard/vehicles")}>
              🚚 Vehicles
            </button>
            <button className="action-btn" onClick={() => navigate("/dashboard/trips")}>
              🛣 Trips
            </button>
            <button className="action-btn" onClick={() => navigate("/dashboard/analytics")}>
              📊 Analytics
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
            title="Maintenance"
            value={12}
            change="In Shop"
            icon={<FaTools />}
            color="#EF4444"
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
        </div>
      </div>
    </DashboardLayout>
  );
}
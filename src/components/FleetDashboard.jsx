import { useVehicles } from '../hooks/useVehicles';
import { Truck, CheckCircle2, Wrench, Activity, Percent } from 'lucide-react';

export default function FleetDashboard() {
  const { vehicles, loading, error } = useVehicles();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500">
        <div className="animate-spin mr-2">
          <Activity size={20} />
        </div>
        Loading dashboard metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        Failed to load dashboard metrics.
      </div>
    );
  }

  const activeVehicles = vehicles.filter((v) => v.status !== 'Retired');
  const totalActive = activeVehicles.length;
  const available = activeVehicles.filter((v) => v.status === 'Available').length;
  const inMaintenance = activeVehicles.filter((v) => v.status === 'In Shop').length;
  const activeTrips = activeVehicles.filter((v) => v.status === 'On Trip').length;
  
  const utilization = totalActive > 0 ? ((activeTrips / totalActive) * 100).toFixed(1) : '0.0';

  const metrics = [
    { label: 'Total Active', value: totalActive, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Available', value: available, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'On Trip', value: activeTrips, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Shop', value: inMaintenance, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Utilization', value: `${utilization}%`, icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${m.bg} ${m.color}`}>
              <Icon size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{m.value}</div>
              <div className="text-sm font-medium text-slate-500">{m.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

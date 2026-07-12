import { useVehicles } from '../hooks/useVehicles';
import { Activity } from 'lucide-react';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Available':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'On Trip':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'In Shop':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Retired':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function VehicleRegistry() {
  const { vehicles, loading, error } = useVehicles();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <div className="animate-spin mr-3">
          <Activity size={24} />
        </div>
        Loading registry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        Failed to load vehicle registry.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-900">Vehicle Registry</h2>
        <p className="text-sm text-slate-500 mt-1">Manage and track all fleet assets in real-time.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Reg. Number</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Name</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Type</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Max Load (kg)</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Odometer (km)</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Cost ($)</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                  No vehicles found in the registry.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{vehicle.regNumber || vehicle.id}</td>
                  <td className="px-6 py-4 text-slate-600">{vehicle.name}</td>
                  <td className="px-6 py-4 text-slate-600">{vehicle.type}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {vehicle.maxLoad ? vehicle.maxLoad.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {vehicle.odometer ? vehicle.odometer.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {vehicle.cost ? `$${vehicle.cost.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(vehicle.status)}`}>
                      {vehicle.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Receipt,
  BarChart3,
  Download,
  Fuel,
  Wrench,
  CircleDollarSign,
  Gauge,
  TrendingUp,
  Truck,
  Loader,
  AlertCircle,
  Plus,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import './ExpensesAndAnalytics.css';

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */
const EXPENSE_TYPES = ['Fuel', 'Toll', 'Maintenance'];
const PLACEHOLDER_REVENUE = 50000;

const INITIAL_FORM_STATE = {
  vehicle: '',
  expenseType: '',
  liters: '',
  cost: '',
  date: ''
};

/* ═══════════════════════════════════════════════════════════════
   1. Custom Hook — Real-time Expense Logs
   ═══════════════════════════════════════════════════════════════ */
function useExpenseLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const logsRef = collection(db, 'ExpenseLogs');
    const unsubscribe = onSnapshot(
      logsRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setLogs(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching expense logs:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { logs, loading, error };
}

/* ═══════════════════════════════════════════════════════════════
   2. Custom Hook — Real-time Vehicles
   ═══════════════════════════════════════════════════════════════ */
function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const vehiclesRef = collection(db, 'Vehicles');
    const unsubscribe = onSnapshot(
      vehiclesRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setVehicles(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching vehicles:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { vehicles, loading, error };
}

/* ═══════════════════════════════════════════════════════════════
   3. KPI Aggregation Engine
   ═══════════════════════════════════════════════════════════════ */
function useAnalytics(vehicles, logs) {
  return useMemo(() => {
    if (!vehicles.length) {
      return {
        perVehicle: [],
        fleetUtilization: 0,
        totalOperationalCost: 0,
        avgFuelEfficiency: 0
      };
    }

    /* ── Per-vehicle aggregation ── */
    const perVehicle = vehicles.map((v) => {
      const vehicleLogs = logs.filter((log) => log.vehicle === v.regNumber);

      const fuelCost = vehicleLogs
        .filter((l) => l.expenseType === 'Fuel')
        .reduce((sum, l) => sum + (Number(l.cost) || 0), 0);

      const maintenanceCost = vehicleLogs
        .filter((l) => l.expenseType === 'Maintenance')
        .reduce((sum, l) => sum + (Number(l.cost) || 0), 0);

      const tollCost = vehicleLogs
        .filter((l) => l.expenseType === 'Toll')
        .reduce((sum, l) => sum + (Number(l.cost) || 0), 0);

      const totalLiters = vehicleLogs
        .filter((l) => l.expenseType === 'Fuel')
        .reduce((sum, l) => sum + (Number(l.liters) || 0), 0);

      const operationalCost = fuelCost + maintenanceCost;

      const fuelEfficiency =
        totalLiters > 0 ? (Number(v.odometer) || 0) / totalLiters : 0;

      const acquisitionCost = Number(v.cost) || 1; // avoid division by zero
      const roi =
        ((PLACEHOLDER_REVENUE - (maintenanceCost + fuelCost)) / acquisitionCost) * 100;

      return {
        regNumber: v.regNumber,
        name: v.name || v.regNumber,
        status: v.status,
        odometer: Number(v.odometer) || 0,
        acquisitionCost,
        fuelCost,
        maintenanceCost,
        tollCost,
        totalLiters,
        operationalCost,
        fuelEfficiency,
        roi
      };
    });

    /* ── Fleet-level KPIs ── */
    const activeVehicles = vehicles.filter(
      (v) => v.status !== 'Retired'
    );
    const onTripVehicles = vehicles.filter(
      (v) => v.status === 'On Trip'
    );
    const fleetUtilization =
      activeVehicles.length > 0
        ? (onTripVehicles.length / activeVehicles.length) * 100
        : 0;

    const totalOperationalCost = perVehicle.reduce(
      (sum, pv) => sum + pv.operationalCost,
      0
    );

    const vehiclesWithEfficiency = perVehicle.filter(
      (pv) => pv.fuelEfficiency > 0
    );
    const avgFuelEfficiency =
      vehiclesWithEfficiency.length > 0
        ? vehiclesWithEfficiency.reduce(
            (sum, pv) => sum + pv.fuelEfficiency,
            0
          ) / vehiclesWithEfficiency.length
        : 0;

    return {
      perVehicle,
      fleetUtilization,
      totalOperationalCost,
      avgFuelEfficiency
    };
  }, [vehicles, logs]);
}

/* ═══════════════════════════════════════════════════════════════
   4. CSV Export Utility
   ═══════════════════════════════════════════════════════════════ */
function downloadCSV(perVehicle, fleetUtilization) {
  const headers = [
    'Vehicle',
    'Name',
    'Status',
    'Odometer (km)',
    'Fuel Cost',
    'Maintenance Cost',
    'Toll Cost',
    'Total Op. Cost',
    'Total Liters',
    'Fuel Efficiency (km/L)',
    'Acquisition Cost',
    'ROI (%)'
  ];

  const rows = perVehicle.map((pv) => [
    pv.regNumber,
    pv.name,
    pv.status,
    pv.odometer,
    pv.fuelCost.toFixed(2),
    pv.maintenanceCost.toFixed(2),
    pv.tollCost.toFixed(2),
    pv.operationalCost.toFixed(2),
    pv.totalLiters.toFixed(2),
    pv.fuelEfficiency.toFixed(2),
    pv.acquisitionCost.toFixed(2),
    pv.roi.toFixed(2)
  ]);

  // Fleet summary row
  rows.push([]);
  rows.push(['Fleet Utilization (%)', fleetUtilization.toFixed(2)]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `TransitOps_Fleet_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════════
   5. Expense Log Form  (Component 1 — Requirement 3.7)
   ═══════════════════════════════════════════════════════════════ */
function ExpenseLogForm({ vehicles }) {
  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear liters if switching away from Fuel
      ...(name === 'expenseType' && value !== 'Fuel' ? { liters: '' } : {})
    }));
  };

  const resetForm = () => {
    setFormData({ ...INITIAL_FORM_STATE });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMsg('');

    try {
      if (!formData.vehicle) throw new Error('Please select a vehicle.');
      if (!formData.expenseType) throw new Error('Please select an expense type.');
      if (!formData.cost || Number(formData.cost) <= 0)
        throw new Error('Cost must be greater than 0.');
      if (!formData.date) throw new Error('Please select a date.');
      if (formData.expenseType === 'Fuel' && (!formData.liters || Number(formData.liters) <= 0))
        throw new Error('Liters must be greater than 0 for fuel expenses.');

      const payload = {
        vehicle: formData.vehicle,
        expenseType: formData.expenseType,
        liters: formData.expenseType === 'Fuel' ? Number(formData.liters) : 0,
        cost: Number(formData.cost),
        date: formData.date,
        createdAt: Timestamp.now()
      };

      // addDoc guarantees a NEW unique document every time — no overwrite risk
      await addDoc(collection(db, 'ExpenseLogs'), payload);

      setSubmitStatus('success');
      resetForm();

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      console.error('Expense submission error:', err);
      setSubmitStatus('error');
      setErrorMsg(err.message || 'Failed to log expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFuel = formData.expenseType === 'Fuel';

  return (
    <div className="ea-form-card">
      <div className="ea-form-card__glow" />

      <div className="ea-form-card__header">
        <div className="ea-form-card__header-icon">
          <Receipt size={20} />
        </div>
        <div className="ea-form-card__header-text">
          <h3 className="ea-form-card__title">Log Expense</h3>
          <p className="ea-form-card__subtitle">
            Record fuel, toll, or maintenance costs
          </p>
        </div>
      </div>

      <div className="ea-form-card__divider" />

      {/* ── Status Messages ── */}
      {submitStatus === 'success' && (
        <div className="ea-form-card__alert ea-form-card__alert--success">
          <CheckCircle2 size={16} />
          Expense logged successfully!
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="ea-form-card__alert ea-form-card__alert--error">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="ea-form">
        {/* Vehicle select */}
        <div className="ea-form__field">
          <label className="ea-form__label">Vehicle</label>
          <div className="ea-form__select-wrap">
            <select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              className="ea-form__select"
              required
            >
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.regNumber}>
                  {v.regNumber} — {v.name || v.type || 'Vehicle'}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="ea-form__select-chevron" />
          </div>
        </div>

        {/* Expense Type select */}
        <div className="ea-form__field">
          <label className="ea-form__label">Expense Type</label>
          <div className="ea-form__select-wrap">
            <select
              name="expenseType"
              value={formData.expenseType}
              onChange={handleChange}
              className="ea-form__select"
              required
            >
              <option value="">Select type…</option>
              {EXPENSE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="ea-form__select-chevron" />
          </div>
        </div>

        {/* Liters — only when Fuel */}
        <div className="ea-form__field">
          <label className="ea-form__label">
            Liters
            {!isFuel && (
              <span className="ea-form__label-hint">(Fuel only)</span>
            )}
          </label>
          <input
            type="number"
            name="liters"
            min="0"
            step="0.01"
            value={formData.liters}
            onChange={handleChange}
            disabled={!isFuel}
            placeholder={isFuel ? 'e.g. 45.5' : 'N/A'}
            className={`ea-form__input ${!isFuel ? 'ea-form__input--disabled' : ''}`}
          />
        </div>

        {/* Cost */}
        <div className="ea-form__field">
          <label className="ea-form__label">Cost (₹)</label>
          <input
            type="number"
            name="cost"
            min="0"
            step="0.01"
            value={formData.cost}
            onChange={handleChange}
            placeholder="e.g. 3500"
            className="ea-form__input"
            required
          />
        </div>

        {/* Date */}
        <div className="ea-form__field">
          <label className="ea-form__label">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="ea-form__input"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="ea-form__submit"
        >
          {isSubmitting ? (
            <>
              <Loader size={16} className="ea-form__spinner" />
              Saving…
            </>
          ) : (
            <>
              <Plus size={16} />
              Log Expense
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. KPI Card (Reusable)
   ═══════════════════════════════════════════════════════════════ */
function KPICard({ icon, label, value, unit, accent }) {
  return (
    <div className={`ea-kpi-card ea-kpi-card--${accent}`}>
      <div className={`ea-kpi-card__icon ea-kpi-card__icon--${accent}`}>
        {icon}
      </div>
      <div className="ea-kpi-card__body">
        <span className="ea-kpi-card__label">{label}</span>
        <div className="ea-kpi-card__value-row">
          <span className="ea-kpi-card__value">{value}</span>
          {unit && <span className="ea-kpi-card__unit">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. Analytics Dashboard (Component 2 — Requirement 3.8)
   ═══════════════════════════════════════════════════════════════ */
function AnalyticsDashboard({ analytics, onDownload }) {
  const { perVehicle, fleetUtilization, totalOperationalCost, avgFuelEfficiency } =
    analytics;

  return (
    <div className="ea-dashboard">
      {/* ── Fleet-Level KPI Summary ── */}
      <div className="ea-dashboard__header">
        <div className="ea-dashboard__header-text">
          <h3 className="ea-dashboard__title">
            <BarChart3 size={20} />
            Fleet Analytics
          </h3>
          <p className="ea-dashboard__subtitle">
            Real-time operational intelligence across your fleet
          </p>
        </div>
        <button
          onClick={onDownload}
          className="ea-dashboard__download-btn"
          title="Download CSV Report"
        >
          <Download size={16} />
          Download Report
        </button>
      </div>

      <div className="ea-dashboard__kpi-grid">
        <KPICard
          icon={<CircleDollarSign size={22} />}
          label="Total Operational Cost"
          value={`₹${totalOperationalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          accent="blue"
        />
        <KPICard
          icon={<Gauge size={22} />}
          label="Avg. Fuel Efficiency"
          value={avgFuelEfficiency.toFixed(2)}
          unit="km/L"
          accent="green"
        />
        <KPICard
          icon={<Truck size={22} />}
          label="Fleet Utilization"
          value={fleetUtilization.toFixed(1)}
          unit="%"
          accent="amber"
        />
        <KPICard
          icon={<TrendingUp size={22} />}
          label="Vehicles Tracked"
          value={perVehicle.length}
          accent="purple"
        />
      </div>

      {/* ── Per-Vehicle Breakdown Table ── */}
      <div className="ea-dashboard__table-card">
        <div className="ea-dashboard__table-card-glow" />
        <h4 className="ea-dashboard__table-title">Per-Vehicle Breakdown</h4>

        <div className="ea-dashboard__table-wrap">
          <table className="ea-dashboard__table">
            <thead className="ea-dashboard__thead">
              <tr>
                <th className="ea-dashboard__th">Vehicle</th>
                <th className="ea-dashboard__th">Status</th>
                <th className="ea-dashboard__th ea-dashboard__th--right">Fuel Cost</th>
                <th className="ea-dashboard__th ea-dashboard__th--right">Maint. Cost</th>
                <th className="ea-dashboard__th ea-dashboard__th--right">Op. Cost</th>
                <th className="ea-dashboard__th ea-dashboard__th--right">Efficiency</th>
                <th className="ea-dashboard__th ea-dashboard__th--right">ROI</th>
              </tr>
            </thead>
            <tbody className="ea-dashboard__tbody">
              {perVehicle.length === 0 ? (
                <tr>
                  <td colSpan="7" className="ea-dashboard__empty-cell">
                    <div className="ea-dashboard__empty">
                      <BarChart3 size={40} className="ea-dashboard__empty-icon" />
                      <p>No vehicle data available yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                perVehicle.map((pv) => (
                  <tr key={pv.regNumber} className="ea-dashboard__row">
                    <td className="ea-dashboard__td">
                      <div className="ea-dashboard__vehicle-cell">
                        <span className="ea-dashboard__vehicle-reg">
                          {pv.regNumber}
                        </span>
                        <span className="ea-dashboard__vehicle-name">
                          {pv.name}
                        </span>
                      </div>
                    </td>
                    <td className="ea-dashboard__td">
                      <span
                        className={`ea-dashboard__status ea-dashboard__status--${pv.status
                          ?.toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {pv.status}
                      </span>
                    </td>
                    <td className="ea-dashboard__td ea-dashboard__td--right ea-dashboard__td--mono">
                      ₹{pv.fuelCost.toLocaleString('en-IN')}
                    </td>
                    <td className="ea-dashboard__td ea-dashboard__td--right ea-dashboard__td--mono">
                      ₹{pv.maintenanceCost.toLocaleString('en-IN')}
                    </td>
                    <td className="ea-dashboard__td ea-dashboard__td--right ea-dashboard__td--mono ea-dashboard__td--highlight">
                      ₹{pv.operationalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="ea-dashboard__td ea-dashboard__td--right ea-dashboard__td--mono">
                      {pv.fuelEfficiency > 0
                        ? `${pv.fuelEfficiency.toFixed(2)} km/L`
                        : '—'}
                    </td>
                    <td className="ea-dashboard__td ea-dashboard__td--right">
                      <span
                        className={`ea-dashboard__roi ${
                          pv.roi >= 0
                            ? 'ea-dashboard__roi--positive'
                            : 'ea-dashboard__roi--negative'
                        }`}
                      >
                        {pv.roi >= 0 ? '+' : ''}
                        {pv.roi.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. Recent Expense Logs Panel
   ═══════════════════════════════════════════════════════════════ */
function RecentLogs({ logs }) {
  const recentLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => {
        // Sort by createdAt descending, then by date descending
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      })
      .slice(0, 10);
  }, [logs]);

  const typeIcon = (type) => {
    switch (type) {
      case 'Fuel':
        return <Fuel size={14} />;
      case 'Maintenance':
        return <Wrench size={14} />;
      case 'Toll':
        return <CircleDollarSign size={14} />;
      default:
        return <Receipt size={14} />;
    }
  };

  if (recentLogs.length === 0) return null;

  return (
    <div className="ea-recent">
      <h4 className="ea-recent__title">Recent Expense Logs</h4>
      <div className="ea-recent__list">
        {recentLogs.map((log) => (
          <div key={log.id} className="ea-recent__item">
            <div
              className={`ea-recent__type-badge ea-recent__type-badge--${log.expenseType?.toLowerCase()}`}
            >
              {typeIcon(log.expenseType)}
              {log.expenseType}
            </div>
            <span className="ea-recent__vehicle">{log.vehicle}</span>
            <span className="ea-recent__cost">
              ₹{Number(log.cost).toLocaleString('en-IN')}
            </span>
            <span className="ea-recent__date">{log.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. Main Composed Module — ExpensesAndAnalytics
   ═══════════════════════════════════════════════════════════════ */
export default function ExpensesAndAnalytics() {
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { logs, loading: logsLoading, error: logsError } = useExpenseLogs();

  const analytics = useAnalytics(vehicles, logs);

  const handleDownload = useCallback(() => {
    downloadCSV(analytics.perVehicle, analytics.fleetUtilization);
  }, [analytics]);

  /* ── Loading State ── */
  if (vehiclesLoading || logsLoading) {
    return (
      <div className="ea-loading">
        <Loader size={40} className="ea-loading__spinner" />
        <p className="ea-loading__text">Loading analytics data…</p>
      </div>
    );
  }

  /* ── Error State ── */
  if (vehiclesError || logsError) {
    return (
      <div className="ea-error-state">
        <AlertCircle size={24} />
        <p>Failed to load data. Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="ea">
      <div className="ea__glow-line" />

      {/* ── Page Header ── */}
      <div className="ea__header">
        <div className="ea__header-info">
          <h2 className="ea__title">
            <div className="ea__title-icon">
              <BarChart3 size={20} />
            </div>
            Expenses & Analytics
          </h2>
          <p className="ea__subtitle">
            Log operational expenses and monitor fleet performance KPIs in real-time.
          </p>
        </div>
      </div>

      {/* ── Two-Column Layout: Form + Recent Logs | Dashboard ── */}
      <div className="ea__layout">
        {/* Left Column — Expense Form + Recent Logs */}
        <div className="ea__sidebar-col">
          <ExpenseLogForm vehicles={vehicles} />
          <RecentLogs logs={logs} />
        </div>

        {/* Right Column — Analytics Dashboard */}
        <div className="ea__main-col">
          <AnalyticsDashboard
            analytics={analytics}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
}

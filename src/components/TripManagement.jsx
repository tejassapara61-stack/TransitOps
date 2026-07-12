import React, { useState, useMemo } from "react";
import "./TripManagement.css";

const STATUS_OPTIONS = ["Draft", "Dispatched", "Completed", "Cancelled"];
const VEHICLE_OPTIONS = ["Van", "Truck", "Mini Truck"];

export default function TripManagement() {
  const [showForm, setShowForm] = useState(false);

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");

  const [trips, setTrips] = useState([]);
  const [nextId, setNextId] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [vehicleFilter, setVehicleFilter] = useState("All Vehicles");

  const resetForm = () => {
    setSource("");
    setDestination("");
    setVehicle("");
    setDriver("");
    setCargoWeight("");
    setPlannedDistance("");
  };

  const saveTrip = () => {
    if (
      !source ||
      !destination ||
      !vehicle ||
      !driver ||
      !cargoWeight ||
      !plannedDistance
    ) {
      alert("Please fill all fields.");
      return;
    }

    const newTrip = {
      id: nextId,
      code: `TRP-${String(nextId).padStart(3, "0")}`,
      source,
      destination,
      vehicle,
      driver,
      cargoWeight,
      plannedDistance,
      status: "Draft",
    };

    setTrips([newTrip, ...trips]);
    setNextId(nextId + 1);
    resetForm();
    setShowForm(false);
  };

  const deleteTrip = (id) => {
    setTrips(trips.filter((trip) => trip.id !== id));
  };

  const cycleStatus = (id) => {
    setTrips(
      trips.map((trip) => {
        if (trip.id !== id) return trip;
        const idx = STATUS_OPTIONS.indexOf(trip.status);
        const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
        return { ...trip, status: next };
      })
    );
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        !search ||
        trip.source.toLowerCase().includes(search.toLowerCase()) ||
        trip.destination.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All Status" || trip.status === statusFilter;
      const matchesVehicle =
        vehicleFilter === "All Vehicles" || trip.vehicle === vehicleFilter;
      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }, [trips, search, statusFilter, vehicleFilter]);

  return (
    <div className="trip-container">
      {/* Header */}
      <div className="trip-header">
        <div className="trip-header-text">
          <span className="trip-eyebrow">Fleet Operations</span>
          <h1>Trip Ledger</h1>
          <p>Log, dispatch, and track every cargo movement on the road.</p>
        </div>

        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <span className="btn-primary-plus">+</span> Log New Trip
        </button>
      </div>

      {/* Stat strip */}
      <div className="trip-stats">
        <div className="trip-stat">
          <span className="trip-stat-value">{trips.length}</span>
          <span className="trip-stat-label">Total Trips</span>
        </div>
        <div className="trip-stat">
          <span className="trip-stat-value">
            {trips.filter((t) => t.status === "Dispatched").length}
          </span>
          <span className="trip-stat-label">Dispatched</span>
        </div>
        <div className="trip-stat">
          <span className="trip-stat-value">
            {trips.filter((t) => t.status === "Completed").length}
          </span>
          <span className="trip-stat-label">Completed</span>
        </div>
        <div className="trip-stat">
          <span className="trip-stat-value">
            {trips
              .reduce((sum, t) => sum + Number(t.plannedDistance || 0), 0)
              .toLocaleString()}
          </span>
          <span className="trip-stat-label">Planned KM</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="trip-filters">
        <input
          type="text"
          className="trip-search"
          placeholder="Search by source or destination"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
        >
          <option>All Vehicles</option>
          {VEHICLE_OPTIONS.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="trip-table-card">
        {filteredTrips.length === 0 ? (
          <div className="trip-empty">
            <div className="trip-empty-mark">—·—·—</div>
            <h3>
              {trips.length === 0
                ? "No trips logged yet"
                : "No trips match your search"}
            </h3>
            <p>
              {trips.length === 0
                ? "Create your first trip to start the manifest."
                : "Try clearing a filter or searching a different route."}
            </p>
          </div>
        ) : (
          <table className="trip-table">
            <thead>
              <tr>
                <th>Waybill</th>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Cargo</th>
                <th>Distance</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip.id}>
                  <td className="trip-code">{trip.code}</td>
                  <td>
                    <div className="trip-route">
                      <span className="trip-route-point">{trip.source}</span>
                      <span className="trip-route-line">
                        <span className="trip-route-dot" />
                      </span>
                      <span className="trip-route-point">
                        {trip.destination}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="trip-tag">{trip.vehicle}</span>
                  </td>
                  <td>{trip.driver}</td>
                  <td className="trip-mono">{trip.cargoWeight} kg</td>
                  <td className="trip-mono">{trip.plannedDistance} km</td>
                  <td>
                    <button
                      className={`trip-status trip-status-${trip.status.toLowerCase()}`}
                      onClick={() => cycleStatus(trip.id)}
                      title="Click to advance status"
                    >
                      {trip.status}
                    </button>
                  </td>
                  <td>
                    <button
                      className="trip-delete"
                      onClick={() => deleteTrip(trip.id)}
                      aria-label={`Delete trip ${trip.code}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-over form */}
      {showForm && (
        <div className="trip-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="trip-form" onClick={(e) => e.stopPropagation()}>
            <div className="trip-form-header">
              <div>
                <span className="trip-eyebrow">New Manifest Entry</span>
                <h2>Log a Trip</h2>
              </div>
              <button
                className="trip-form-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <div className="trip-form-grid">
              <label>
                Source
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Ahmedabad Depot"
                />
              </label>

              <label>
                Destination
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Surat Warehouse"
                />
              </label>

              <label>
                Vehicle
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                >
                  <option value="">Select vehicle</option>
                  {VEHICLE_OPTIONS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>

              <label>
                Driver
                <input
                  type="text"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  placeholder="Driver name"
                />
              </label>

              <label>
                Cargo Weight (kg)
                <input
                  type="number"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  placeholder="0"
                />
              </label>

              <label>
                Planned Distance (km)
                <input
                  type="number"
                  value={plannedDistance}
                  onChange={(e) => setPlannedDistance(e.target.value)}
                  placeholder="0"
                />
              </label>
            </div>

            <div className="trip-form-actions">
              <button
                className="btn-ghost"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={saveTrip}>
                Save Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

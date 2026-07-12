import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Truck, Plus, AlertCircle, Loader, Edit, Trash2, X, Save } from 'lucide-react';
import './VehicleRegistry.css';

/* ─────────────────────────────────────────────────────────────
   1. Real-Time Data Hook
───────────────────────────────────────────────────────────── */
export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const vehiclesRef = collection(db, 'Vehicles');
    const unsubscribe = onSnapshot(
      vehiclesRef,
      (snapshot) => {
        const vehiclesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setVehicles(vehiclesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching vehicles: ", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { vehicles, loading, error };
}

/* ─────────────────────────────────────────────────────────────
   2. Helper Components
───────────────────────────────────────────────────────────── */
const getStatusBadge = (status) => {
  switch (status) {
    case 'Available':
      return (
        <div className="vr-badge badge-available">
          <span className="vr-badge__dot"></span>
          Available
        </div>
      );
    case 'On Trip':
      return (
        <div className="vr-badge badge-ontrip">
          <span className="vr-badge__dot"></span>
          On Trip
        </div>
      );
    case 'In Shop':
      return (
        <div className="vr-badge badge-inshop">
          <span className="vr-badge__dot"></span>
          In Shop
        </div>
      );
    case 'Retired':
      return (
        <div className="vr-badge badge-retired">
          <span className="vr-badge__dot"></span>
          Retired
        </div>
      );
    default:
      return (
        <div className="vr-badge">
          Unknown
        </div>
      );
  }
};

/* ─────────────────────────────────────────────────────────────
   3. Add/Edit Vehicle Modal
───────────────────────────────────────────────────────────── */
function AddEditVehicleModal({ isOpen, onClose, editingVehicle }) {
  const [formData, setFormData] = useState({
    regNumber: '',
    name: '',
    type: '',
    maxLoad: '',
    odometer: '',
    cost: '',
    status: 'Available'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        ...editingVehicle,
        maxLoad: editingVehicle.maxLoad?.toString() || '',
        odometer: editingVehicle.odometer?.toString() || '',
        cost: editingVehicle.cost?.toString() || ''
      });
    } else {
      setFormData({
        regNumber: '',
        name: '',
        type: '',
        maxLoad: '',
        odometer: '',
        cost: '',
        status: 'Available'
      });
    }
    setErrorMsg('');
  }, [editingVehicle, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const docId = formData.regNumber.trim();
      if (!docId) throw new Error("Registration Number is required and acts as the unique ID.");

      const vehicleData = {
        ...formData,
        maxLoad: Number(formData.maxLoad),
        odometer: Number(formData.odometer),
        cost: Number(formData.cost)
      };

      const vehicleRef = doc(db, "Vehicles", docId);
      
      if (!editingVehicle) {
        const docSnap = await getDoc(vehicleRef);
        if (docSnap.exists()) {
          throw new Error("A vehicle with this Registration Number already exists.");
        }
      }

      await setDoc(vehicleRef, vehicleData, { merge: true });
      
      setFormData({
        regNumber: '',
        name: '',
        type: '',
        maxLoad: '',
        odometer: '',
        cost: '',
        status: 'Available'
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save vehicle data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="vrm-backdrop">
      <div className="vrm-overlay" onClick={onClose} />
      
      <div className="vrm-card" onClick={(e) => e.stopPropagation()}>
        <div className="vrm-glow-line" />
        
        <div className="vrm-header">
          <button type="button" onClick={onClose} className="vrm-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
          
          <div className="vrm-header-row">
            <div className="vrm-header-icon">
              {editingVehicle ? <Edit size={20} /> : <Plus size={20} />}
            </div>
            <div className="vrm-header-text">
              <h2 className="vrm-title">{editingVehicle ? 'Edit Vehicle Profile' : 'Register New Vehicle'}</h2>
              <p className="vrm-subtitle">
                {editingVehicle ? 'Update fleet asset details.' : 'Add a new asset to the fleet.'}
              </p>
            </div>
          </div>
        </div>

        <div className="vrm-divider" />

        {errorMsg && (
          <div className="vrm-error-wrap">
            <div className="vrm-error">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="vrm-form">
          
          <div className="vrm-section">
            <p className="vrm-section-label">Vehicle Identity</p>
            
            <div className="vrm-row">
              <div className="vrm-field">
                <label className="vrm-label">Registration Number</label>
                <input
                  required
                  type="text"
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleChange}
                  disabled={!!editingVehicle}
                  placeholder="e.g. MH-01-AB-1234"
                  className="vrm-input"
                />
              </div>
              <div className="vrm-field">
                <label className="vrm-label">Vehicle Name / Model</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Volvo FH16"
                  className="vrm-input"
                />
              </div>
            </div>
            
            <div className="vrm-row">
              <div className="vrm-field">
                <label className="vrm-label">Type</label>
                <input
                  required
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="e.g. Heavy Truck"
                  className="vrm-input"
                />
              </div>
              <div className="vrm-field">
                <label className="vrm-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="vrm-input vrm-select"
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>
          </div>

          <div className="vrm-divider--light" />

          <div className="vrm-section">
            <p className="vrm-section-label">Metrics & Cost</p>
            
            <div className="vrm-row">
              <div className="vrm-field">
                <label className="vrm-label">Max Load (kg)</label>
                <input
                  required
                  type="number"
                  min="0"
                  name="maxLoad"
                  value={formData.maxLoad}
                  onChange={handleChange}
                  className="vrm-input"
                  placeholder="e.g. 15000"
                />
              </div>
              <div className="vrm-field">
                <label className="vrm-label">Odometer (km)</label>
                <input
                  required
                  type="number"
                  min="0"
                  name="odometer"
                  value={formData.odometer}
                  onChange={handleChange}
                  className="vrm-input"
                  placeholder="e.g. 45000"
                />
              </div>
            </div>
            
            <div className="vrm-row">
              <div className="vrm-field">
                <label className="vrm-label">Acquisition Cost</label>
                <input
                  required
                  type="number"
                  min="0"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="vrm-input"
                  placeholder="e.g. 5000000"
                />
              </div>
            </div>
          </div>

          <div className="vrm-actions">
            <button type="button" onClick={onClose} className="vrm-btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="vrm-btn-submit">
              <Save size={16} />
              {isSubmitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────
   4. Main VehicleRegistry Module
───────────────────────────────────────────────────────────── */
export default function VehicleRegistry() {
  const { vehicles, loading, error } = useVehicles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (regNumber) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${regNumber}?`)) {
      try {
        await deleteDoc(doc(db, "Vehicles", regNumber));
      } catch (err) {
        console.error("Error deleting vehicle: ", err);
        alert("Failed to delete vehicle.");
      }
    }
  };

  if (loading) {
    return (
      <div className="vr-loading">
        <Loader className="vr-loading__spinner" size={40} />
        <p className="vr-loading__text">Loading Fleet Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vr-error-state">
        <AlertCircle size={24} />
        Failed to load vehicle data. Please try again.
      </div>
    );
  }

  return (
    <div className="vr">
      <div className="vr__glow-line"></div>
      
      <div className="vr__header">
        <div className="vr__header-info">
          <h2 className="vr__title">
            <div className="vr__title-icon">
              <Truck size={20} />
            </div>
            Vehicle Fleet Registry
          </h2>
          <p className="vr__subtitle">Manage logistics assets, telemetry, and operational status.</p>
        </div>
        <button className="vr__add-btn" onClick={handleAdd}>
          <Plus size={18} />
          Register Vehicle
        </button>
      </div>

      <div className="vr__table-wrap">
        <table className="vr__table">
          <thead className="vr__thead">
            <tr>
              <th className="vr__th">Reg. Number</th>
              <th className="vr__th">Name / Model</th>
              <th className="vr__th">Type</th>
              <th className="vr__th text-right" style={{textAlign: 'right'}}>Max Load</th>
              <th className="vr__th text-right" style={{textAlign: 'right'}}>Odometer</th>
              <th className="vr__th text-right" style={{textAlign: 'right'}}>Cost</th>
              <th className="vr__th">Status</th>
              <th className="vr__th vr__th--right">Actions</th>
            </tr>
          </thead>
          <tbody className="vr__tbody">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan="8" className="vr__empty-cell">
                  <div className="vr__empty">
                    <Truck size={48} className="vr__empty-icon" />
                    <p className="vr__empty-text">No vehicles found in registry.</p>
                    <button onClick={handleAdd} className="vr__empty-link">
                      Register your first vehicle &rarr;
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="vr__row">
                  <td className="vr__td vr__td--mono">{vehicle.regNumber}</td>
                  <td className="vr__td vr__td--name">{vehicle.name}</td>
                  <td className="vr__td">
                    <span className="vr__type-tag">{vehicle.type}</span>
                  </td>
                  <td className="vr__td text-right" style={{textAlign: 'right'}}>
                    <span className="vr__num">{vehicle.maxLoad.toLocaleString()}</span>
                    <span className="vr__num-unit">kg</span>
                  </td>
                  <td className="vr__td text-right" style={{textAlign: 'right'}}>
                    <span className="vr__num">{vehicle.odometer.toLocaleString()}</span>
                    <span className="vr__num-unit">km</span>
                  </td>
                  <td className="vr__td text-right" style={{textAlign: 'right'}}>
                    <span className="vr__num-unit">$</span>
                    <span className="vr__num vr__num--cost">{vehicle.cost.toLocaleString()}</span>
                  </td>
                  <td className="vr__td">
                    {getStatusBadge(vehicle.status)}
                  </td>
                  <td className="vr__td vr__td--right">
                    <button 
                      onClick={() => handleEdit(vehicle)} 
                      className="vr__edit-btn"
                      title="Edit Vehicle"
                      style={{ marginRight: '8px' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(vehicle.regNumber)} 
                      className="vr__edit-btn"
                      title="Delete Vehicle"
                      style={{ color: '#f87171' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddEditVehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingVehicle={editingVehicle}
      />
    </div>
  );
}

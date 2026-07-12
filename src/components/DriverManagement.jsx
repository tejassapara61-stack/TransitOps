import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, UserPlus, AlertTriangle, Activity, Edit2, X, Save, Shield, Phone, Calendar, Hash, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './DriverModal.css';
import './DriverFleetControl.css';

/* ─────────────────────────────────────────────────────────────
   1. Real-Time Data Hook
───────────────────────────────────────────────────────────── */
export function useDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const driversRef = collection(db, 'Drivers');
    const unsubscribe = onSnapshot(
      driversRef,
      (snapshot) => {
        const driversData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setDrivers(driversData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching drivers: ", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { drivers, loading, error };
}

/* ─────────────────────────────────────────────────────────────
   2. Helper Components
───────────────────────────────────────────────────────────── */
const getStatusBadge = (status) => {
  switch (status) {
    case 'Available':
      return (
        <div className="dfc-badge dfc-badge--available">
          <span className="dfc-badge__dot dfc-badge__dot--available"></span>
          Available
        </div>
      );
    case 'On Trip':
      return (
        <div className="dfc-badge dfc-badge--trip">
          <span className="dfc-badge__dot dfc-badge__dot--trip"></span>
          On Trip
        </div>
      );
    case 'Off Duty':
      return (
        <div className="dfc-badge dfc-badge--off">
          <span className="dfc-badge__dot dfc-badge__dot--off"></span>
          Off Duty
        </div>
      );
    case 'Suspended':
      return (
        <div className="dfc-badge dfc-badge--suspended">
          <span className="dfc-badge__dot dfc-badge__dot--suspended"></span>
          Suspended
        </div>
      );
    default:
      return (
        <div className="dfc-badge dfc-badge--off">
          Unknown
        </div>
      );
  }
};

const isExpired = (expiryDateString) => {
  if (!expiryDateString) return false;
  const expiry = new Date(expiryDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry < today;
};

const getSafetyColor = (score) => {
  if (score >= 80) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
};

/* ─────────────────────────────────────────────────────────────
   3. Add/Edit Driver Modal  —  Portal-based premium popup
───────────────────────────────────────────────────────────── */



function AddEditDriverModal({ isOpen, onClose, editingDriver }) {
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: 'LMV',
    licenseExpiryDate: '',
    contactNumber: '',
    safetyScore: 100,
    status: 'Available'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /* Reset form on open / driver change */
  useEffect(() => {
    if (editingDriver) {
      setFormData(editingDriver);
    } else {
      setFormData({
        name: '',
        licenseNumber: '',
        licenseCategory: 'LMV',
        licenseExpiryDate: '',
        contactNumber: '',
        safetyScore: 100,
        status: 'Available'
      });
    }
    setErrorMsg('');
  }, [editingDriver, isOpen]);

  /* Lock body scroll while modal is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* Close on Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'safetyScore' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const docId = formData.licenseNumber.trim();
      if (!docId) throw new Error("License Number is required and acts as the unique ID.");

      const driverRef = doc(db, "Drivers", docId);
      
      // If we are adding a NEW driver, make sure this ID doesn't already exist
      if (!editingDriver) {
        const docSnap = await getDoc(driverRef);
        if (docSnap.exists()) {
          throw new Error("A driver with this License Number already exists.");
        }
      }

      // Save or update the document
      await setDoc(driverRef, formData, { merge: true });
      
      // Explicitly reset the form so it doesn't carry over to the next "Add New"
      setFormData({
        name: '',
        licenseNumber: '',
        licenseCategory: 'LMV',
        licenseExpiryDate: '',
        contactNumber: '',
        safetyScore: 100,
        status: 'Available'
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save driver profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Portal: render at document.body to escape overflow / stacking-context traps ── */
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="driver-modal-backdrop"
          className="dm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Click-to-close overlay */}
          <div className="dm-overlay" onClick={onClose} />

          {/* ── Modal Card ── */}
          <motion.div
            key="driver-modal-card"
            className="dm-card"
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top glow accent line */}
            <div className="dm-glow-line" />

            {/* ── Header ── */}
            <div className="dm-header">
              <button
                type="button"
                onClick={onClose}
                className="dm-close-btn"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              <div className="dm-header-row">
                <div className="dm-header-icon">
                  {editingDriver
                    ? <Edit2 size={18} />
                    : <UserPlus size={18} />
                  }
                </div>
                <div className="dm-header-text">
                  <h2 className="dm-title">
                    {editingDriver ? 'Edit Driver Profile' : 'Enlist New Driver'}
                  </h2>
                  <p className="dm-subtitle">
                    {editingDriver
                      ? 'Update personnel record and license parameters.'
                      : 'Register a new fleet member to the system.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Header divider */}
            <div className="dm-divider" />

            {/* ── Error Banner ── */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="dm-error-wrap"
                >
                  <div className="dm-error">
                    <AlertTriangle size={15} />
                    {errorMsg}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Form Body ── */}
            <form id="driver-form" onSubmit={handleSubmit} className="dm-form">

              {/* Section: Personal Info */}
              <div className="dm-section">
                <p className="dm-section-label">Personal Information</p>

                <div className="dm-field">
                  <label className="dm-label">
                    <User size={13} />
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="dm-input"
                  />
                </div>

                <div className="dm-row">
                  <div className="dm-field">
                    <label className="dm-label">
                      <Phone size={13} />
                      Contact Number
                    </label>
                    <input
                      required
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="dm-input"
                    />
                  </div>

                  <div className="dm-field">
                    <label className="dm-label">
                      <Activity size={13} />
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="dm-input dm-select"
                    >
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="dm-divider-light" />

              {/* Section: License Details */}
              <div className="dm-section">
                <p className="dm-section-label">License Details</p>

                <div className="dm-row">
                  <div className="dm-field">
                    <label className="dm-label">
                      <Hash size={13} />
                      License Number
                    </label>
                    <input
                      required
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      disabled={!!editingDriver}
                      placeholder="DL-0420110012345"
                      className="dm-input"
                    />
                  </div>

                  <div className="dm-field">
                    <label className="dm-label">
                      Category
                    </label>
                    <select
                      name="licenseCategory"
                      value={formData.licenseCategory}
                      onChange={handleChange}
                      className="dm-input dm-select"
                    >
                      <option value="LMV">LMV</option>
                      <option value="HMV">HMV</option>
                      <option value="MCWG">MCWG</option>
                    </select>
                  </div>
                </div>

                <div className="dm-row">
                  <div className="dm-field">
                    <label className="dm-label">
                      <Calendar size={13} />
                      Expiry Date
                    </label>
                    <input
                      required
                      type="date"
                      name="licenseExpiryDate"
                      value={formData.licenseExpiryDate}
                      onChange={handleChange}
                      className="dm-input"
                    />
                  </div>

                  <div className="dm-field">
                    <label className="dm-label">
                      <Shield size={13} />
                      Safety Score (0–100)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      max="100"
                      name="safetyScore"
                      value={formData.safetyScore}
                      onChange={handleChange}
                      className="dm-input"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="dm-divider-light" />

              {/* ── Actions ── */}
              <div className="dm-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="dm-btn-cancel"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="dm-btn-submit"
                >
                  <Save size={15} />
                  {isSubmitting ? 'Saving…' : editingDriver ? 'Update Driver' : 'Save Driver'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────
   4. Main DriverManagement Module
───────────────────────────────────────────────────────────── */
export default function DriverManagement() {
  const { drivers, loading, error } = useDrivers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const handleAdd = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="dfc-loading">
        <Activity className="dfc-loading__spinner" size={36} />
        <p className="dfc-loading__text">Syncing Driver Uplink...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dfc-error-state">
        <AlertTriangle size={24} />
        Connection to Fleet Network severed. Retrying...
      </div>
    );
  }

  return (
    <div className="dfc">
      {/* Subtle top glow */}
      <div className="dfc__glow-line"></div>
      
      {/* Header */}
      <div className="dfc__header">
        <div className="dfc__header-text">
          <h2 className="dfc__title">
            <div className="dfc__title-icon">
              <Users size={20} />
            </div>
            Driver Fleet Control
          </h2>
          <p className="dfc__subtitle">Manage personnel parameters, licensing, and safety telemetry.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="dfc__add-btn"
        >
          <UserPlus size={18} />
          Enlist Driver
        </motion.button>
      </div>

      {/* Data Table */}
      <div className="dfc__table-wrap">
        <table className="dfc__table">
          <thead className="dfc__thead">
            <tr>
              <th className="dfc__th">Driver Name</th>
              <th className="dfc__th">License ID</th>
              <th className="dfc__th">Class</th>
              <th className="dfc__th">Expiry</th>
              <th className="dfc__th">Comms</th>
              <th className="dfc__th">Safety Index</th>
              <th className="dfc__th">Status</th>
              <th className="dfc__th dfc__th--right">Actions</th>
            </tr>
          </thead>
          <tbody className="dfc__tbody">
            {drivers.length === 0 ? (
              <tr>
                <td colSpan="8" className="dfc__empty-cell">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="dfc__empty"
                  >
                    <Users size={40} className="dfc__empty-icon" />
                    <p className="dfc__empty-text">No personnel data found.</p>
                    <button onClick={handleAdd} className="dfc__empty-link">
                      Initialize first record &rarr;
                    </button>
                  </motion.div>
                </td>
              </tr>
            ) : (
              drivers.map((driver) => {
                const expired = isExpired(driver.licenseExpiryDate);
                const safetyLevel = getSafetyColor(driver.safetyScore);
                return (
                  <tr 
                    key={driver.id} 
                    className={`dfc__row ${expired ? 'dfc__row--expired' : ''}`}
                  >
                    <td className="dfc__td dfc__td--name">{driver.name}</td>
                    <td className="dfc__td dfc__td--mono">{driver.licenseNumber}</td>
                    <td className="dfc__td">
                      <span className="dfc__category-tag">{driver.licenseCategory}</span>
                    </td>
                    <td className="dfc__td">
                      <div className={`dfc__expiry ${expired ? 'dfc__expiry--expired' : ''}`}>
                        {driver.licenseExpiryDate}
                        {expired && (
                          <motion.div
                            animate={{ rotate: [-4, 4, -4] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          >
                            <AlertTriangle size={16} className="dfc__expiry-icon" />
                          </motion.div>
                        )}
                      </div>
                    </td>
                    <td className="dfc__td dfc__td--mono">{driver.contactNumber}</td>
                    <td className="dfc__td">
                      <div className="dfc__safety">
                        <span className={`dfc__safety-score dfc__safety-score--${safetyLevel}`}>
                          {driver.safetyScore}
                        </span>
                        <div className="dfc__safety-track">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${driver.safetyScore}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`dfc__safety-fill dfc__safety-fill--${safetyLevel}`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="dfc__td">
                      {getStatusBadge(driver.status)}
                    </td>
                    <td className="dfc__td dfc__td--right">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(driver)}
                        className="dfc__edit-btn"
                        title="Edit Driver"
                      >
                        <Edit2 size={16} />
                      </motion.button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AddEditDriverModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingDriver={editingDriver}
      />
    </div>
  );
}

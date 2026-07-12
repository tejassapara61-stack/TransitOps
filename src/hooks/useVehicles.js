import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

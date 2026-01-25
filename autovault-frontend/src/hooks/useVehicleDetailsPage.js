import { useState, useEffect } from "react";
import {
  getVehicleByIdService,
  getRelatedVehiclesService,
} from "../services/vehicleDetailsPageService";

export function useVehicleDetails(vehicleId) {
  const [vehicle, setVehicle] = useState(null);
  const [relatedVehicles, setRelatedVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const vehicleData = await getVehicleByIdService(vehicleId);
        const relatedData = await getRelatedVehiclesService(vehicleId);
        setVehicle(vehicleData);
        setRelatedVehicles(relatedData);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [vehicleId]);

  return { vehicle, relatedVehicles, loading, error };
}

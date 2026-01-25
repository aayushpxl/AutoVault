import { useState } from "react";
import { searchVehiclesService } from "../services/vehicleDetailsPageService";

export function useVehicleSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchVehiclesService(query);
      setResults(data);
    } catch (err) {
        console.error("Search error:", err);
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}

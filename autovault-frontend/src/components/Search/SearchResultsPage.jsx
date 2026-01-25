import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchVehiclesService } from "../../services/vehicleDetailsPageService";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import {
  FaGasPump,
  FaWeightHanging,
  FaUserFriends,
} from "react-icons/fa";
import {
  useAddSavedVehicle,
  useRemoveSavedVehicle,
  useSavedVehicles,
} from "../../hooks/useSaveVehicle";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResultsPage() {
  const query = useQuery().get("query") || "";
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { savedVehicles = [] } = useSavedVehicles();
  const { mutate: addToSaved } = useAddSavedVehicle();
  const { mutate: removeFromSaved } = useRemoveSavedVehicle();

  const isVehicleSaved = (id) =>
    savedVehicles.some((v) => v?.vehicleId?._id === id);

  const toggleSaveVehicle = (vehicleId) => {
    if (isVehicleSaved(vehicleId)) {
      removeFromSaved(vehicleId);
    } else {
      addToSaved(vehicleId);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;

      setLoading(true);
      setError("");

      try {
        const results = await searchVehiclesService(query);
        setVehicles(results);
      } catch (err) {
        setError(err.message || "Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">
        Search results for: <span className="text-blue-600">{query}</span>
      </h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && vehicles.length === 0 && (
        <p className="text-gray-600">No vehicles found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((vehicle) => {
          const isSaved = isVehicleSaved(vehicle._id);
          return (
            <div
              key={vehicle._id}
              className="relative rounded-xl border border-black-200 bg-white overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <button
                onClick={() => toggleSaveVehicle(vehicle._id)}
                className="absolute top-3 right-3 z-10 p-1 bg-transparent focus:outline-none"
                title={isSaved ? "Unsave" : "Save"}
              >
                {isSaved ? (
                  <FaHeart className="text-black text-xl" />
                ) : (
                  <FaRegHeart className="text-black text-xl" />
                )}
              </button>

              <div
                onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                className="cursor-pointer"
              >
                <div className="h-40 flex items-center justify-center border-b">
                  <img
                    src={
                      vehicle.filepath
                        ? `http://localhost:5000/uploads/${vehicle.filepath}`
                        : "/placeholder.jpg"
                    }
                    alt={vehicle.vehicleName}
                    className="max-h-full max-w-[90%] object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-base">
                    {vehicle.vehicleName}
                  </h3>
                  <p className="text-xs text-[#64748b] mt-1">
                    {vehicle.vehicleType || "Unknown Type"}
                  </p>
                  <div className="flex gap-4 mt-4 text-sm text-[#64748b]">
                    <div className="flex items-center gap-1">
                      <FaGasPump style={{ color: "#90A3BF" }} />
                      {vehicle.fuelCapacityLitres}L
                    </div>
                    <div className="flex items-center gap-1">
                      <FaWeightHanging style={{ color: "#90A3BF" }} />
                      {vehicle.loadCapacityKg}kg
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUserFriends style={{ color: "#90A3BF" }} />
                      {vehicle.passengerCapacity} People
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-gray-600">
                    {vehicle.vehicleDescription?.slice(0, 80)}...
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-auto border-t pt-3 px-4 pb-4">
                <div className="text-[#0f766e] font-semibold text-base">
                  ₹{vehicle.pricePerTrip?.toFixed(2)}
                  <span className="text-gray-500 text-xs"> /trip</span>
                </div>
                <button
                  onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-md"
                >
                  Rent Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

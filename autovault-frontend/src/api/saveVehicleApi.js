import axios from './Api';

// 🔹 Get saved vehicles
export const getSavedVehiclesApi = () => axios.get("/saved-vehicles");

// 🔹 Add saved vehicle
export const addSavedVehicleApi = (vehicleId) =>
  axios.post("/saved-vehicles", { vehicleId });

// 🔹 Remove saved vehicle
export const removeSavedVehicleApi = (vehicleId) =>
  axios.delete(`/saved-vehicles/${vehicleId}`);

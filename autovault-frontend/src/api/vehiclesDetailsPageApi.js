import axios from "./Api"; // Your axios instance

// Get single vehicle by ID
export const getVehicleByIdApi = (id) =>
  axios.get(`/vehicles/${id}`);

// Get related vehicles by vehicle ID
export const getRelatedVehiclesApi = (id) =>
  axios.get(`/vehicles/related/${id}`);

export const searchVehiclesApi = (query) =>
  axios.get(`/vehicles/search?query=${query}`);

import { getVehicleByIdApi, getRelatedVehiclesApi } from "../api/vehiclesDetailsPageApi";

export const getVehicleByIdService = async (id) => {
  try {
    const response = await getVehicleByIdApi(id);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to load vehicle" };
  }
};

export const getRelatedVehiclesService = async (id) => {
  try {
    const response = await getRelatedVehiclesApi(id);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to load related vehicles" };
  }
};
export const searchVehiclesService = async (query) => {
  const response = await fetch(`http://localhost:5000/api/vehicles/search?query=${encodeURIComponent(query)}`);

  if (!response.ok) {
    const errorText = await response.text();  // get text to help debug
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};



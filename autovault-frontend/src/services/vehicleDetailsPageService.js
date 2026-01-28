import api from '../api/Api';

export const getVehicleByIdService = async (id) => {
  try {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to load vehicle" };
  }
};

export const getRelatedVehiclesService = async (id) => {
  try {
    const response = await api.get(`/vehicles/related/${id}`);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to load related vehicles" };
  }
};

export const searchVehiclesService = async (query) => {
  try {
    const response = await api.get(`/vehicles/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};



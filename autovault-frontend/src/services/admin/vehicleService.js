import { 
  getAllVehicleApi, createVehicleApi, getOneVehicleApi, 
  updateOneVehicleApi, deleteOneVehicleApi, getVehicleTypesApi
} from "../../api/admin/vehicleApi";

export const getAllVehicleService = async () => {
  try {
    const response = await getAllVehicleApi();
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch vehicles' };
  }
};

export const createVehicleService = async (data) => {
  try {
    const response = await createVehicleApi(data);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to create vehicle' };
  }
};

export const getOneVehicleService = async (id) => {
  try {
    const response = await getOneVehicleApi(id);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to load vehicle' };
  }
};

export const updateVehicleService = async (id, data) => {
  try {
    const response = await updateOneVehicleApi(id, data);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to update vehicle' };
  }
};

export const deleteVehicleService = async (id) => {
  try {
    const response = await deleteOneVehicleApi(id);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to delete vehicle' };
  }
};
export const getVehicleTypesService = async () => {
  try {
    const response = await getVehicleTypesApi();
    return response.data; // should be an array of strings (vehicle types)
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch vehicle types' };
  }
};

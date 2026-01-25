import axios from "../Api";

// Get all vehicles
export const getAllVehicleApi = (params) => 
  axios.get("/admin/vehicle/", { params });

// Create a new vehicle with possible image upload (multipart/form-data)
export const createVehicleApi = (data) => 
  axios.post("/admin/vehicle/create", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// Get single vehicle by ID
export const getOneVehicleApi = (id) => 
  axios.get(`/admin/vehicle/${id}`);

// Update vehicle by ID with possible image upload (multipart/form-data)
export const updateOneVehicleApi = (id, data) => 
  axios.put(`/admin/vehicle/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// Delete vehicle by ID
export const deleteOneVehicleApi = (id) => 
  axios.delete(`/admin/vehicle/${id}`);

export const getVehicleTypesApi = () => 
  axios.get("/vehicles/types");

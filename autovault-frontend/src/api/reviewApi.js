import axios from "./Api"; 

// 🔹 Add a new review
export const addReviewApi = (reviewData) => {
  return axios.post("/reviews", reviewData);
};

// 🔹 Get all reviews for a specific vehicle
export const getVehicleReviewsApi = (vehicleId) => {
  return axios.get(`/reviews/${vehicleId}`);
};

// 🔹 (Optional) Get all reviews (Admin View)
export const getAllReviewsApi = () => {
  return axios.get("/reviews"); 
};
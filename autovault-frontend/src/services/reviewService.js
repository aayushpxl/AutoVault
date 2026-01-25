
import {
  addReviewApi,
  getVehicleReviewsApi,
  getAllReviewsApi,
} from "../api/reviewApi";

// 🔹 Add a new review
export const addReviewService = async (reviewData) => {
  const response = await addReviewApi(reviewData);
  return response.data;
};

// 🔹 Get all reviews for a specific vehicle
export const getVehicleReviewsService = async (vehicleId) => {
  const response = await getVehicleReviewsApi(vehicleId);
  return response.data;
};

// 🔹 (Optional) Get all reviews (admin)
export const getAllReviewsService = async () => {
  const response = await getAllReviewsApi();
  return response.data;
};
import {
  getAllBookingApi,
  getMyBookingsApi,
  createBookingApi,
  cancelBookingApi,
  deleteBookingApi,
  updateBookingApi,
  getOneBookingApi
} from "../api/bookingApi";

// Get all bookings (admin)
export const getAllBookingService = async () => {
  try {
    const response = await getAllBookingApi();
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch bookings" };
  }
};

// Get logged-in user's bookings
export const getMyBookingsService = async () => {
  try {
    const response = await getMyBookingsApi();
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch your bookings" };
  }
};

// Create a new booking
export const createBookingService = async (data) => {
  try {
    const response = await createBookingApi(data);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to create booking" };
  }
};

// Cancel a booking
export const cancelBookingService = async (id) => {
  try {
    const response = await cancelBookingApi(id);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to cancel booking" };
  }
};

// Update a booking
export const updateBookingService = async (id, updatedData) => {
  try {
    const response = await updateBookingApi(id, updatedData);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to update booking" };
  }
};

// Delete a booking
export const deleteBookingService = async (id) => {
  try {
    const response = await deleteBookingApi(id);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to delete booking" };
  }
};
// 🔹 Get one booking by ID
export const getOneBookingService = async (id) => {
  try {
    const response = await getOneBookingApi(id);
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch booking" };
  }
};
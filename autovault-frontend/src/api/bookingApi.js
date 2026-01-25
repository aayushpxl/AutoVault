import axios from "./Api";

//  Get all bookings (admin)
export const getAllBookingApi = (params) => axios.get("/bookings", { params });

//  Get bookings of the logged-in user
export const getMyBookingsApi = () => axios.get("/bookings/my");

//  Create a booking
export const createBookingApi = (data) => axios.post("/bookings", data);

// Get one booking by ID
export const getOneBookingApi = (id) => axios.get(`/bookings/${id}`);

//  Cancel a booking
export const cancelBookingApi = (id) => axios.patch(`/bookings/${id}/cancel`);

//  Update a booking (e.g., change pickup/drop/startDate/endDate)
export const updateBookingApi = (id, updatedData) => axios.patch(`/bookings/${id}`, updatedData);

// Delete a booking
export const deleteBookingApi = (id) => axios.delete(`/bookings/${id}`);

// Undo cancel a booking by setting status back to "confirmed"
export const undoCancelBookingApi = (id) =>
  updateBookingApi(id, { status: "confirmed" });

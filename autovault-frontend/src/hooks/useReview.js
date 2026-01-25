import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addReviewService,
  getVehicleReviewsService,
  getAllReviewsService,
} from "../services/reviewService";
import { toast } from "react-toastify";

// 🔹 Submit a new review (user)
export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add_review"],
    mutationFn: addReviewService,
    onSuccess: (_, variables) => {
      toast.success("Review submitted");
      // Invalidate the cache for the specific vehicle's reviews to update UI
      queryClient.invalidateQueries(["vehicle_reviews", variables.vehicleId]);
      // Also optionally invalidate all reviews (for admin pages etc)
      queryClient.invalidateQueries(["all_reviews"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add review");
    },
  });
};

// 🔹 Get reviews for a specific vehicle
export const useVehicleReviews = (vehicleId) => {
  const query = useQuery({
    queryKey: ["vehicle_reviews", vehicleId],
    queryFn: () => getVehicleReviewsService(vehicleId),
    enabled: !!vehicleId,
  });

  return {
    ...query,
    reviews: query.data || [],
  };
};

// 🔹 Admin: Get all reviews across users/vehicles
export const useAllReviews = () => {
  const query = useQuery({
    queryKey: ["all_reviews"],
    queryFn: getAllReviewsService,
  });

  return {
    ...query,
    reviews: query.data || [],
  };
};

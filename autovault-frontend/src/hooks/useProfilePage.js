import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLoggedInUserApi, updateLoggedInUserApi, deleteLoggedInUserApi, updateProfilePictureApi } from "../api/admin/userApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


// Fetch logged-in user profile
const fetchUserProfile = async () => {
  const { data } = await getLoggedInUserApi();
  return data.data; // assuming your API response has { data: {...} }
};

// Update logged-in user profile
const updateUserProfile = async (profileData) => {
  const { data } = await updateLoggedInUserApi(profileData);
  return data.data;
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["loggedInUserProfile"],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useUpdateUserProfile = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Optimistically update the cache with the new user data
      queryClient.setQueryData(["loggedInUserProfile"], data);
      queryClient.invalidateQueries(["loggedInUserProfile"]);
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      if (options.onError) options.onError(error);
    },
  });
};

export const useUpdateProfilePicture = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("profilePic", file);
      const { data } = await updateProfilePictureApi(formData);
      return data; // This should be { success: true, profilePic: '...' }
    },
    onSuccess: (data) => {
      // Immediately sync the profilePic field in the user cache
      queryClient.setQueryData(["loggedInUserProfile"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, profilePic: data.profilePic };
      });
      queryClient.invalidateQueries(["loggedInUserProfile"]);
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      if (options.onError) options.onError(error);
    },
  });
};

export const useDeleteUserProfile = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // You can replace this with your actual navigation method

  return useMutation({
    mutationFn: deleteLoggedInUserApi,
    onSuccess: () => {
      toast.success("Account deleted successfully");
      queryClient.clear();
      localStorage.clear();
      navigate("/login");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete account.");
    },
  });
};

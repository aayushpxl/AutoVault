import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllVehicleService,
  createVehicleService,
  getOneVehicleService,
  updateVehicleService,
  deleteVehicleService,
  getVehicleTypesService
} from "../../services/admin/vehicleService";
import { toast } from "react-toastify";

export const useAdminVehicles = () => {
  const query = useQuery({
    queryKey: ["admin_vehicles"],
    queryFn: () => getAllVehicleService(),
  });

  const vehicles = query.data?.data || [];

  return {
    ...query,
    vehicles,
  };
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin_create_vehicle"],
    mutationFn: createVehicleService,
    onSuccess: () => {
      toast.success("Vehicle created successfully");
      queryClient.invalidateQueries(["admin_vehicles"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create vehicle");
    },
  });
};

export const useGetOneVehicle = (id) => {
  const query = useQuery({
    queryKey: ["admin_vehicle_details", id],
    queryFn: () => getOneVehicleService(id),
    enabled: !!id,
    retry: false,
  });

  const vehicle = query.data?.data || {};

  return {
    ...query,
    vehicle,
  };
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin_update_vehicle"],
    mutationFn: ({ id, data }) => updateVehicleService(id, data),
    onSuccess: () => {
      toast.success("Vehicle updated successfully");
      queryClient.invalidateQueries(["admin_vehicles"]);
      queryClient.invalidateQueries(["admin_vehicle_details"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update vehicle");
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin_delete_vehicle"],
    mutationFn: deleteVehicleService,
    onSuccess: () => {
      toast.success("Vehicle deleted successfully");
      queryClient.invalidateQueries(["admin_vehicles"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete vehicle");
    },
  });
};
export const useVehicleTypes = () => {
  const query = useQuery({
    queryKey: ["vehicle_types"],
    queryFn: () => getVehicleTypesService(),
    staleTime: 1000 * 60 * 5,  // cache for 5 minutes, adjust as needed
  });

  const vehicleTypes = query.data || [];

  return {
    ...query,
    vehicleTypes,
  };
};

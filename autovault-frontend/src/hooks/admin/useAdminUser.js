import { keepPreviousData,useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from 'axios'; 


//useQuery -> Get request state
import { useState } from "react";
import { getAllUserService, createUserService, updateUserService, deleteUserService, getOneUserService, getLoggedInUserService,updateLoggedInUserService, sendResetLinkService, resetPasswordService  } from "../../services/admin/userService";

export const useAdminUser = (page = 1, limit = 5) => {
  const query = useQuery({
    queryKey: ["admin_user", page, limit],
    queryFn: () => getAllUserService({ page, limit }),
    keepPreviousData: true,
  });

  return { ...query };
};
  export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin_create_user"],
    mutationFn: createUserService,
    onSuccess: () => {
      queryClient.invalidateQueries("admin_user");
    }
  });
};

export const useUpdateOneUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateUserService(id, data),
    mutationKey: ["admin_user_update"],
    onSuccess: () => {
      toast.success("Updated")
      queryClient.invalidateQueries(
        ["admin_user", "admin_user_details"]
      )
    },
    onError: (err) => {
      toast.error(err.message || " Update Failed")
    }

  })
}
export const useGetOneUser = (id) => {
  const query = useQuery({
    queryKey: ["admin_user_details", id],
    queryFn: () => getOneUserService(id),
    enabled: !!id,
    retry: false,
  });

  const user = query.data?.data || {};

  return {
    ...query,
    user,
  };
};


export const useDeleteOneUser = () =>{
  const queryClient = useQueryClient()
  return useMutation(
    {
      mutationFn: deleteUserService,
      mutationKey : ["admin_user_delete"],
      onSuccess: () =>{
        toast.success("Delete")
        queryClient.invalidateQueries(["admin_user"])
      },
      onError: (err) =>{
        toast.error(err.message || "Delete failed")
      }
    }
  )
}
// const fetchUserCount = async () => {
//   const res = await axios.get("/api/admin/user/count");
//   return res.data; // { success: true, total: number }
// };
// export const useUserCount = () => {
//   return useQuery({
//     queryKey: ["user_count"],
//     queryFn: fetchUserCount,
//     staleTime: 5 * 60 * 1000,
//   });
// };
export const useLoggedInUser = () => {
  return useQuery({
    queryKey: ["logged_in_user"],
    queryFn: getLoggedInUserService,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Update logged-in user profile
export const useUpdateLoggedInUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLoggedInUserService,
    mutationKey: ["update_logged_in_user"],
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries(["logged_in_user"]);
    },
    onError: (err) => {
      toast.error(err.message || "Update failed");
    },
  });
};


// 🔐 Forgot Password Hook
export const useSendResetLink = () => {
  return useMutation({
    mutationKey: ["send_reset_link"],
    mutationFn: sendResetLinkService,
    onSuccess: (res) => {
      toast.success(res.message || "Reset link sent to email");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send reset link");
    },
  });
};

// 🔐 Reset Password Hook
export const useResetPassword = () => {
  return useMutation({
    mutationKey: ["reset_password"],
    mutationFn: ({ token, password }) => resetPasswordService(token, password),
    onSuccess: (res) => {
      toast.success(res.message || "Password has been reset");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reset password");
    },
  });
};

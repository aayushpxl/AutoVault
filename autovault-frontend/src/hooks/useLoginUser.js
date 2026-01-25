import { toast } from "react-toastify";
import { loginUserService } from "../services/authService";
import { useMutation } from "@tanstack/react-query";

export const useLoginUser = () => {
  return useMutation({
    mutationFn: loginUserService,
    mutationKey: ['login-key'],
    onError: (err) => {
      toast.error(err?.message || "Login Failed");
      console.log(err);
    }
  });
};

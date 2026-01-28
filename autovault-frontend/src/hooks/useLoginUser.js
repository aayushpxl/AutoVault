import { toast } from "react-toastify";
import { loginUserService } from "../services/authService";
import { useMutation } from "@tanstack/react-query";

export const useLoginUser = () => {
  return useMutation({
    mutationFn: loginUserService,
    mutationKey: ['login-key'],
    onError: (err) => {
      // Error will be displayed in the form UI only
      console.log(err);
    }
  });
};

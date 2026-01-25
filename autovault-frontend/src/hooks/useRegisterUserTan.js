import { useMutation } from "@tanstack/react-query";
import { registerUserService } from "../services/authService";
import { toast } from "react-toastify"
import { data } from "react-router-dom";

export const userRegisterUserTan = () =>{
    return useMutation(
        {
            mutationFn: registerUserService,// which function to run
            mutationKey: ['register'],
            onSuccess: (data) =>{
                toast.success(data.message) || "Registration Successfull"
            },
            onError: (err) =>{
                toast.error(err.message || "Registration Failed")
            }
        }
    )
}

//mutationFn: (fromData) => registerUserService(fromData)
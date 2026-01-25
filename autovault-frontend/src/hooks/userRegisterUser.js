import { useState } from "react";
import { registerUser as registerUserService } from "../services/authService";

export const useRegisterUser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const register = async (formData) => {
        setData(null)
        setIsLoading(true);
        setError(null);
        try {
            const response = await registerUserService(formData);
            setData(response);
            return response;
        } catch (err) {
            console.log(err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        register,
        isLoading,
        error,
        data,
    };
}
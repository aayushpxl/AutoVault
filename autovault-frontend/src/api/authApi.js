import axios from './Api';

export const registerUserApi = (data) => axios.post("/auth/register", data);
export const loginUserApi = (data) => axios.post("/auth/login", data);
export const verifyMFALoginApi = (data) => axios.post("/mfa/verify-login", data);
export const resendVerificationApi = (data) => axios.post("/auth/resend-verification", data);
export const setupMFAApi = () => axios.post("/mfa/setup");
export const verifyMFASetupApi = (data) => axios.post("/mfa/verify-setup", data);
export const disableMFAApi = (data) => axios.post("/mfa/disable", data);
export const getMFAStatusApi = () => axios.get("/mfa/status");

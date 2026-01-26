import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRouter from './routers/AppRouter.jsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from 'react-router-dom';
import AuthContextProvider from './auth/AuthProvider'; // ✅ Import your Auth provider
import { ToastContainer, Slide } from "react-toastify"; // If using toast
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from './components/scroll/ScrollToTop.jsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <ScrollToTop />
          <AppRouter />

          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar={false}
            theme="dark"
            transition={Slide}
          />
        </AuthContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

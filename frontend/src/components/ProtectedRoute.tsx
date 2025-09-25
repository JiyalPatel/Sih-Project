import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const token = localStorage.getItem("token");

    // If there's a token, render the child routes
    // Otherwise, redirect to the login page
    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

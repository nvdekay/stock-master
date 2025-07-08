import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ requiredRoles }) {
    // extract user from AuthProvider context
    const { user } = useAuth();

    // if no user has been set yet, make you go to login
    if (!user) {
        alert("You must log in first!")
        return <Navigate to="/login" />;
    }

    const role = ["role1", "role2"];

    if (requiredRoles && !requiredRoles.includes(user.role)) {
        alert("You must be a/an " + requiredRoles + " to be able to view this page!")
        return <Navigate to="/home" />;
    }

    return <Outlet />;
}

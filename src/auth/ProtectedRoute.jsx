import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ requiredRoles }) {
    // extract user from AuthProvider context
    const { user, loading } = useAuth();
    // const user1 = JSON.parse(localStorage.getItem("user"));

    if (loading) {
        return <div>Loading...</div>;
    }
    // if no user has been set yet, make you go to login
    if (!user) {
        alert("You must log in first!")
        return <Navigate to="/auth/login" />;
    }
    // console.log(requiredRoles.includes("admin"))
    // console.log("role", user.userData.role)

    if (requiredRoles && !requiredRoles.includes(user.role)) {
        alert("You must be a/an " + requiredRoles + " to be able to view this page!")
        return <Navigate to="/" />;
    }

    return <Outlet />;
}

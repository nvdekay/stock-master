import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import RedirectPage from "../pages/auth/Unauthorized";
import { jwtDecode } from "jwt-decode";


export default function ProtectedRoute({ requiredRoles }) {
    // extract user from AuthProvider context
    const { user, loading, token } = useAuth();
    // const user1 = JSON.parse(localStorage.getItem("user"));

    if (loading) {
        return <div>Loading...</div>;
    }
    // if no user has been set yet, make you go to login
    if (!user) {
        // alert("You must log in first!")
        return <RedirectPage
            message={`You must be logged in first!`}
            pageName="Login Page"
            redirectUrl="/auth/login"
        />
    }


    if (token) {
        try {
            const decoded = jwtDecode(token);
            // console.log(decoded); // This will print the payload of the JWT
            const exp = decoded.exp;
            const currentTime = Math.floor(Date.now() / 1000); // current time in seconds

            if (exp < currentTime) {
                // console.log("Token has expired");
                return <RedirectPage
                    message={`Your token was expired!`}
                    pageName="Login Page"
                    redirectUrl="/auth/login"
                />

            }
        } catch (error) {
            // console.error("Invalid token", error);
                return <RedirectPage
                    message={`Your token is invalid!`}
                    pageName="Login Page"
                    redirectUrl="/auth/login"
                />
        }
    }
    // console.log(requiredRoles.includes("admin"))
    // console.log("role", user.userData.role)

    if (requiredRoles && !requiredRoles.includes(user.role)) {
        return <RedirectPage
            message={`You must have ${requiredRoles} privileges to access this content`}
            pageName="Home Page"
            redirectUrl="/"
        />
    }

    return <Outlet />;
}

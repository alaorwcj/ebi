import { Navigate } from "react-router-dom";
import { getRole } from "../api/auth.js";
import { toast } from "sonner";

/**
 * RoleRoute — wraps a page that requires specific roles.
 * If the user's role is not in `allowed`, redirects to /ebis with a toast.
 *
 * @param {string[]} allowed  - List of roles that can access this route.
 * @param {ReactNode} children
 */
export default function RoleRoute({ allowed, children }) {
    const role = getRole();
    if (!allowed.includes(role)) {
        // Toast is not reliable here (component not mounted yet), so we use
        // sessionStorage to pass the message and show it on the destination page.
        sessionStorage.setItem("access_denied", "1");
        return <Navigate to="/ebis" replace />;
    }
    return children;
}

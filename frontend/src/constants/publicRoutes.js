import AdminDashboard from "../pages/Public/AdminDashboard/AdminDashboard";
import Login from "../pages/Public/Login/Login";

export const PUBLIC_ROUTES = [
  {
    link: "/",
    name: "Login",
    component: <Login />,
  },
  {
    link: "/admin",
    name: "AdminDashboard",
    component: <AdminDashboard />,
  },
];

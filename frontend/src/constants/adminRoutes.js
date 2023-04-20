import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import Upload from "../pages/Admin/Upload/Upload";

const ADMIN_ROUTES = [
  {
    link: "/",
    name: "Dashboard",
    component: <Dashboard />,
  },
  {
    link: "/upload",
    name: "Upload",
    component: <Upload />,
  },
];

export default ADMIN_ROUTES;

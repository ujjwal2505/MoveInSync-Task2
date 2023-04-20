import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleRoutes from "./rbac/RoleRoutes";
import PublicRoutes from "./PublicRoutes/PublicRoutes";
import axios from "axios";
import { useContext, useEffect } from "react";
import { UserContext } from "./contexts/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

function App() {
  const { user } = useContext(UserContext);

  axios.defaults.baseURL =
    process.env.NODE_ENV === "production"
      ? "https://moveinsync-backend-lwg2mitpd-ujjwal2505.vercel.app"
      : "http://localhost:8080";
  axios.defaults.headers.userId = user.phoneNo;
  axios.defaults.headers.name = user.name;

  return (
    <div className="">
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard/*" element={<RoleRoutes />} />
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

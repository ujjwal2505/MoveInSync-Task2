import { useState, useEffect, useContext } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "../constants/publicRoutes";
import PageNotFound from "../pages/Public/PageNotFound/PageNotFound";
import { UserContext } from "../contexts/UserContext";

const PublicRoutes = () => {
  const navigate = useNavigate();
  const { authenticated } = useContext(UserContext);
  // useEffect(() => {
  //   if (authenticated) {
  //   }
  // }, [authenticated]);

  return (
    <Routes>
      {PUBLIC_ROUTES.map((route) => (
        <Route
          key={route.name}
          path={route.link}
          exact
          element={route.component}
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default PublicRoutes;

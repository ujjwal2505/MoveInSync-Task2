import { createContext, useEffect, useState } from "react";
import { ROLES } from "../constants/role";
import { ROLE_ROUTES } from "../rbac/constants";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const initialUserState = {
    role: "",
    phoneNo: "",
    name: "",
    registrationNo: "",
  };
  const [user, setUser] = useState(initialUserState);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    console.log("hello from context");
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    //get token
    //fetch user
    //get role
    //set everything

    if (!!localStorage.getItem("token")) {
      const obj = JSON.parse(localStorage.getItem("token"));

      if (!!obj.token) {
        console.log("authenticated");
        setUser({
          role: ROLES.ADMIN,
          phoneNo: obj.phoneNo,
          name: obj.name,
          registrationNo: obj.registrationNo,
        });
        setAuthenticated(true);
      }
    } else {
      setAuthenticated(false);
      setUser(initialUserState);
    }
  };

  return (
    <UserContext.Provider
      value={{ authenticated, user, setUser, setAuthenticated }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;

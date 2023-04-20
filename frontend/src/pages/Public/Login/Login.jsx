import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import TextField from "@mui/material/TextField";
import "./Login.scss";
import { toast } from "react-toastify";

const Login = () => {
  const [fields, setfields] = useState({
    phoneNo: "",
    code: "",
  });
  const [showOTP, setShowOTP] = useState(false);

  const { authenticated, setAuthenticated, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const handleChange = (state, e) => {
    setfields({
      ...fields,
      [state]: e.target.value,
    });
  };

  const handleGetCode = async () => {
    try {
      const res = await axios.post("/api/getcode", {
        phoneNo: fields.phoneNo,
        channel: "sms",
      });

      if (res.data?.success) {
        toast.success(res.data?.message);
        setShowOTP(true);
      }
    } catch (error) {
      if (!error.response.data.success) {
        toast.error(error.response.data.message);
      }
      console.log(error);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await axios.post("/api/verifycode", {
        phoneNo: fields.phoneNo,
        code: fields.code,
      });

      if (res.data.success) {
        localStorage.setItem("token", JSON.stringify(res.data));
        // setAuthenticated(true);
        // setUser({
        //   role: res.data.role,
        //   phoneNo: res.data.phoneNo,
        // });
        window.location.href = "/dashboard";
      }
    } catch (error) {
      if (!error.response.data.success) {
        toast.error(error.response.data.message);
      }
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-heading">Login</h2>
      <img src="https://play-lh.googleusercontent.com/m20UKsOBJWtPaXKDEPY82IRjQZ_GUsbt-ll9QJUvoHDufFCzFk97jNHYtLG_kj9YbjU" />

      <TextField
        label="Enter your Phone No"
        variant="outlined"
        onChange={(e) => handleChange("phoneNo", e)}
        value={fields.phoneNo}
        disabled={showOTP}
        className="input-field"
      />

      {!showOTP && (
        <button onClick={handleGetCode} className="custom-btn">
          Get Code
        </button>
      )}

      {showOTP && (
        <>
          <TextField
            label="Enter the OTP"
            variant="outlined"
            onChange={(e) => handleChange("code", e)}
            value={fields.code}
            className="input-field"
          />
          <button onClick={handleVerifyCode} className="custom-btn">
            Verify Code
          </button>
        </>
      )}
    </div>
  );
};

export default Login;

import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import PayrollCard from "../../../components/PayrollCard/PayrollCard";
import axios from "axios";
import moment from "moment";
import "./Dashboard.scss";

import CircularProgress from "@mui/material/CircularProgress";
import { UserContext } from "../../../contexts/UserContext";

const Dashboard = () => {
  const navigate = useNavigate();

  const [driverData, setDriverData] = useState([]);
  const [notUploaded, setNotUploaded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(UserContext);

  const currentMonth = moment().format("MMMM");

  const getSheetData = async () => {
    try {
      const res = await axios.get("/api/getSheetData");

      if (res.data.success) {
        let arr = res.data.data.reverse();
        setDriverData(arr);

        if (!!arr.length && arr[0].uploadMonth === currentMonth) {
          console.log("Already Uploaded");
          setNotUploaded(false);
        }
        // arr?.map((entry) => {
        //   const uploadYear = entry.uploadDateTime.split("/")[2].slice(0, 4);
        //   if (
        //     entry.uploadMonth === mntName &&
        //     uploadYear === d.getFullYear().toString()
        //   ) {
        //     console.log("Already Uploaded");
        //     setNotUploaded(false);
        //     return;
        //   }
        // });
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);

      console.log(error);
    }
  };

  useEffect(() => {
    console.log("hello from dashboard");
    (async () => {
      await getSheetData();
    })();
  }, []);

  return (
    <div>
      <div className="dashboard">
        <h1 className="dashboard_heading">Welcome {user.name}</h1>

        {!isLoading && driverData.length ? (
          notUploaded ? (
            <p>
              Upload photos for {currentMonth}{" "}
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate("/dashboard/upload")}
              >
                Upload
              </Button>
            </p>
          ) : (
            <p>Photos uploaded for {currentMonth}</p>
          )
        ) : null}
      </div>

      {isLoading ? (
        <div className="dashboard_loading">
          <CircularProgress />
        </div>
      ) : notUploaded && !driverData.length ? (
        <div className="dashboard_upload">
          <p className="dashboard_upload__text">
            Upload photos for {currentMonth} month
          </p>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/dashboard/upload")}
          >
            Upload
          </Button>
        </div>
      ) : (
        <div className="profile_payroll">
          <h3>Payroll History</h3>
          {driverData.map((el, idx) => (
            <PayrollCard
              el={el}
              key={el.id}
              index={idx}
              currentMonth={currentMonth}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPayrollCard from "../../../components/AdminPayrollCard/AdminPayrollCard";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
  const [alignment, setAlignment] = useState("all");
  const [driverData, setDriverData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const headers = {
    name: "",
    userId: "",
  };

  const getSheet = async () => {
    try {
      const res = await axios.get("/api/getSheetData", {
        headers,
      });
      if (res.data.success) {
        const reverseData = res.data.data.reverse();
        setDriverData(reverseData);
        setFilteredData(reverseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await getSheet();
    })();
  }, []);

  const handleApproval = async (row) => {
    const payload = {
      number: row.number,
      name: row.name,
    };

    try {
      const res = await axios.post("/api/createCashgram", payload, { headers });
      if (res.data.success) {
        let payloadData = {
          ...row,
          approval: "Approved",
          payoutLink: res.data.data,
        };

        updateApproval(payloadData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const updateApproval = async (payload) => {
    try {
      const { data } = await axios.post("/api/updateSheetData", payload, {
        headers,
      });
      if (data.success) {
        console.log(data.message);
        await getSheet();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = (value) => {
    if (value) {
      setFilteredData(
        driverData.filter((entry) => {
          return entry.approval === value;
        })
      );
    } else {
      setFilteredData(driverData);
    }
  };

  const handleAlignmentChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  return (
    <div>
      <div className="admin_top">
        <h1>Welcome</h1>
      </div>

      <div className="admin_container">
        <div className="admin_filters">
          <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive={true}
            onChange={handleAlignmentChange}
            size="small"
          >
            <ToggleButton
              onClick={() => {
                handleFilter();
              }}
              value="all"
            >
              All
            </ToggleButton>
            <ToggleButton
              onClick={() => {
                handleFilter("Pending");
              }}
              value="Pending"
            >
              Pending
            </ToggleButton>
            <ToggleButton
              onClick={() => {
                handleFilter("Approved");
              }}
              value="Approved"
            >
              Approved
            </ToggleButton>
            <ToggleButton
              onClick={() => {
                handleFilter("Rejected");
              }}
              value="Rejected"
            >
              Rejected
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        {filteredData?.map((el) => {
          return (
            <AdminPayrollCard
              el={el}
              key={el.id}
              updateApproval={updateApproval}
              handleApproval={handleApproval}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;

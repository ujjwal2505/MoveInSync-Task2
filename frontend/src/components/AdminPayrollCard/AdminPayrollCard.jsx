import "./AdminPayrollCard.scss";
import { Button } from "@mui/material";

const AdminPayrollCard = ({ el, updateApproval, handleApproval }) => {
  const handleReject = (row) => {
    let payload = {
      ...row,
      approval: "Rejected",
      payoutLink: "",
    };
    updateApproval(payload);
  };

  const imageView = ["Back", "Front", "Left", "Right"];

  return (
    <div className="admin-payroll_card">
      <div className="admin-payroll_card_row">
        <div className="title">Name:</div>
        <div className="value">{el.name}</div>
      </div>
      <div className="admin-payroll_card_row">
        <div className="title">Number:</div>
        <div className="value">{el.number}</div>
      </div>
      <div className="admin-payroll_card_row">
        <div className="title">Upload Month:</div>
        <div className="value">{el.uploadMonth}</div>
      </div>
      <div className="admin-payroll_card_row">
        <div className="title">Uploaded On:</div>
        <div className="value">{el.uploadDateTime}</div>
      </div>
      <div className="admin-payroll_card_row">
        <div className="title">Approval:</div>
        <div className="value">{el.approval}</div>
      </div>

      {el.approval === "Approved" && (
        <div className="admin-payroll_card_row">
          <div className="title">Payout Link:</div>
          {el.payoutLink.toLowerCase() !== "claimed" ? (
            <div className="value">Payout link sent</div>
          ) : (
            <div className="value">{el.payoutLink}</div>
          )}
        </div>
      )}

      <div className="admin-payroll_card_row">
        <div className="title">Links:</div>
        <div className="links">
          {el.links
            .split(",")
            .sort()
            .map((link, index) => (
              <a
                href={link}
                target="_blank"
                className="value links-text"
                key={index}
              >
                {imageView[index]}
              </a>
            ))}
        </div>
      </div>

      {el.approval === "Pending" && (
        <div className="admin-payroll_card_button">
          <Button
            color="success"
            onClick={() => handleApproval(el)}
            variant="contained"
            size="small"
          >
            Approve
          </Button>
          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={() => handleReject(el)}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminPayrollCard;

import { Link, useNavigate } from "react-router-dom";
import "./PayrollCard.scss";
import { Button } from "@mui/material";

const PayrollCard = ({ el, index, currentMonth }) => {
  const navigate = useNavigate();

  const imageView = ["Back", "Front", "Left", "Right"];

  return (
    <div className="payroll_card">
      <div className="payroll_card_row">
        <div className="title">Approval:</div>
        <div className="value">{el.approval}</div>
      </div>

      <div className="payroll_card_row">
        <div className="title">Uploaded On:</div>
        <div className="value">{el.uploadDateTime}</div>
      </div>

      {el.approval === "Approved" && (
        <div className="payroll_card_row">
          <div className="title">Payout Link:</div>
          {el.payoutLink.toLowerCase() !== "claimed" ? (
            <a href={el.payoutLink} className="value links-text">
              Payout Link
            </a>
          ) : (
            <div className="value">{el.payoutLink}</div>
          )}
        </div>
      )}

      <div className="payroll_card_row">
        <div className="title">Links:</div>
        <div className="links">
          {el.links
            .split(",")
            .sort()
            .map((link, index) => {
              return (
                <a
                  href={link}
                  target="_blank"
                  className="value links-text"
                  key={index}
                >{`${imageView[index]}`}</a>
              );
            })}
        </div>
      </div>

      {el.approval === "Rejected" &&
        el.uploadMonth === currentMonth &&
        index === 0 && (
          <div className="payroll_card_button">
            <Button
              variant="contained"
              size="small"
              fullWidth={true}
              onClick={() => navigate("/dashboard/upload")}
            >
              Upload Again
            </Button>
          </div>
        )}
    </div>
  );
};

export default PayrollCard;

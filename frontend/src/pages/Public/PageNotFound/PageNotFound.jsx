import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PageNotFound.scss";

const PageNotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <div className="not-found__title">Oops!</div>
        <p className="not-found__text">
          We're sorry, the page you requested could not be found.
        </p>
        <p className="not-found__text">
          Please check the URL for errors and try again, or visit our{" "}
          <Link to="/dashboard" className="not-found__link">
            homepage
          </Link>
          .
        </p>
        <Link to="/dashboard" className="not-found__button">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;

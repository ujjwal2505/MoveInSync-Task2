import { useCallback, useRef } from "react";
import Webcam from "react-webcam";
import "./Webcam.scss";
import { Button } from "@mui/material";

const WebCamContainer = ({ img, setImg }) => {
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: window.innerHeight,
    height: window.innerWidth,
    aspectRatio: window.innerWidth / window.innerHeight,
    facingMode: "environment",
  };

  const capture = useCallback(() => {
    const base64Data = webcamRef.current.getScreenshot();
    setImg(base64Data);
  }, [webcamRef, setImg]);

  return (
    <div className="cam_container">
      {img === null ? (
        <>
          <Webcam
            audio={false}
            mirrored={true}
            height={400}
            width={"100%"}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            videoConstraints={videoConstraints}
          />
          <Button variant="contained" className="webButton" onClick={capture}>
            Capture photo
          </Button>
        </>
      ) : (
        <>
          <img className="webImg" src={img} alt="screenshot" />
          <Button
            variant="contained"
            className="webButton"
            onClick={() => setImg(null)}
          >
            Retake
          </Button>
        </>
      )}
    </div>
  );
};

export default WebCamContainer;

import { useContext, useEffect, useState } from "react";
import WebCamContainer from "../../../components/Webcam/Webcam.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { Button, IconButton } from "@mui/material";
import "./Upload.scss";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import moment from "moment";

const Upload = () => {
  const navigate = useNavigate();

  const [img1, setImg1] = useState(null);
  const [img2, setImg2] = useState(null);
  const [img3, setImg3] = useState(null);
  const [img4, setImg4] = useState(null);
  const [web1Enable, setW1E] = useState(false);
  const [web2Enable, setW2E] = useState(false);
  const [web3Enable, setW3E] = useState(false);
  const [web4Enable, setW4E] = useState(false);
  const [links, setLinks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  let linksArr = [];
  const uploadToS3 = async (image, view) => {
    const fileName = `image-${view}-${Date.now()}.jpeg`;

    const data = {
      image: image,
      fileName: fileName,
    };

    try {
      const res = await axios.post("/upload-s3", data);
      linksArr.push(res.data.data.Location);
      setLinks((prev) => [...prev, res.data.data.Location]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    if (!(img1 && img2 && img3 && img4)) {
      toast.error("All pictures are required!");
    } else {
      setIsUploading(true);

      const images = [
        {
          img: img1,
          view: "front",
        },
        {
          img: img2,
          view: "left",
        },
        {
          img: img3,
          view: "right",
        },
        {
          img: img4,
          view: "back",
        },
      ];
      for (let i = 0; i < images.length; i++) {
        await uploadToS3(images[i].img, images[i].view);
      }

      setLinks(linksArr);

      //code of ML model
      if (true) {
        await uploadImagesToSheet();
      }
    }
  };

  const uploadImagesToSheet = async () => {
    const payload = {
      uploadMonth: moment().format("MMMM"),
      uploadDateTime: moment().format("DD-MMM-YYYY / HH:mm A"),
      links: linksArr,
      approval: "Pending",
      payoutLink: "Pending",
    };

    console.log(payload);
    try {
      const res = await axios.post("/api/postSheetData", payload);
      if (res.data.success) {
        setIsUploading(false);
        toast.success(res.data.message);
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const imgUpd = [
    {
      img: img1,
      setImg: setImg1,
      we: web1Enable,
      weF: setW1E,
      text: "Add Front view with Cab registration visible",
    },
    {
      img: img2,
      setImg: setImg2,
      we: web2Enable,
      weF: setW2E,
      text: "Side left view with both gates visible",
    },
    {
      img: img3,
      setImg: setImg3,
      we: web3Enable,
      weF: setW3E,
      text: "Side right view with both gates visible",
    },
    {
      img: img4,
      setImg: setImg4,
      we: web4Enable,
      weF: setW4E,
      text: "Back of the car with cab registration visible",
    },
  ];

  return (
    <div>
      <div className="upload_top">
        <ArrowBackIcon onClick={() => navigate(-1)} />
        <h1>Upload</h1>
      </div>
      <div className="upload_photo_box">
        {imgUpd.map((card, index) => {
          return (
            <div key={index} className="upload_window">
              {card.we ? (
                <WebCamContainer img={card.img} setImg={card.setImg} />
              ) : (
                <>
                  <IconButton
                    onClick={() => {
                      card.weF(!card.we);
                    }}
                  >
                    <AddAPhotoIcon />
                  </IconButton>
                  <p>{card.text}</p>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center" }}>
        <Button
          variant="contained"
          style={{ margin: "2rem" }}
          onClick={handleSubmit}
          disabled={isUploading}
        >
          Upload
        </Button>
      </div>
    </div>
  );
};

export default Upload;

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const cfSdk = require("cashfree-sdk");
const moment = require("moment");

const morgan = require("morgan");
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

const spreadsheetId = process.env.DATABASE_ID;

function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  return auth;
}

/* ----------------------- Proccure Google Sheet method ---------------------- */
async function getGoogleSheet(auth) {
  const client = await auth.getClient();
  const googleSheet = google.sheets({ version: "v4", auth: client });
  return googleSheet;
}

// const client = require("twilio")(
//   process.env.ACCOUNT_SID,
//   process.env.AUTH_TOKEN
// );

app.post("/api/getcode", async (req, res) => {
  try {
    // const verification = await client.verify.v2
    //   .services(process.env.VERIFY_SERVICE_SID)
    //   .verifications.create({
    //     to: `+91${req.body.phoneNo}`,
    //     channel: req.body.channel,
    //   });
    // if (verification.status == "pending") {
    //   res.status(200).json({
    //     success: true,
    //     message: `OTP SENT to ${req.body.phoneNo}`,
    //   });
    // }

    const auth = getAuth();
    const googleSheet = await getGoogleSheet(auth);

    const getSheetData = await googleSheet.spreadsheets.values.get({
      auth,
      spreadsheetId,
      //   range: 'Sheet1!A2:B',
      range: "Sheet2!A2:A",
    });
    const cols = getSheetData.data.values;

    let numberExsits = cols.some((el) => {
      console.log(req.body.phoneNo, el);
      return el[0] === req.body.phoneNo;
    });

    if (!numberExsits) {
      return res.status(404).json({
        success: false,
        message: `Number not registered`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `OTP SENT to ${req.body.phoneNo}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      success: false,
      message: `Something went wrong`,
    });
  }
});

app.post("/api/verifycode", async (req, res) => {
  try {
    // client.verify.v2
    //   .services(process.env.VERIFY_SERVICE_SID)
    //   .verificationChecks.create({
    //     to: `+91${req.body.phoneNo}`,
    //     code: req.body.code,
    //   })
    //   .then((verification) => {
    //     console.log("verification", verification);
    //     if (verification.valid) {
    //       return res.status(200).json({
    //         success: true,
    //         token: verification.sid,
    //         role: "ADMIN",
    //         phoneNo: req.body.phoneNo,
    //       });
    //     } else {
    //       return res.status(404).json({
    //         success: false,
    //         message: "WRONG OTP",
    //       });
    //     }
    //   });

    if (req.body.code !== "1234") {
      return res.status(404).json({
        success: false,
        message: "WRONG OTP",
      });
    }

    const auth = getAuth();
    const googleSheet = await getGoogleSheet(auth);

    const getSheetData = await googleSheet.spreadsheets.values.get({
      auth,
      spreadsheetId,
      //   range: 'Sheet1!A2:B',
      range: "Sheet2!A2:C",
    });
    const cols = getSheetData.data.values;
    let name = "";
    let registrationNo = "";

    cols.some((el) => {
      if (el[0] === req.body.phoneNo) {
        name = el[1];
        registrationNo = el[2];
        return true;
      }
    });

    return res.status(200).json({
      success: true,
      token: uuidv4(),
      role: "ADMIN",
      registrationNo,
      phoneNo: req.body.phoneNo,
      name,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: "WRONG OTP",
    });
  }
});

/* -------------------------------- AWS S3 Services ------------------------------- */

app.post("/upload-s3", (req, res) => {
  const { image, fileName } = req.body;
  const base64String = image.replace(/^data:image\/\w+;base64,/, "");
  const buff = new Buffer(base64String, "base64");
  // Set the S3 key and parameters
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buff,
    ContentType: "image/jpeg",
    ACL: "public-read",
  };

  // Upload the file to S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.log("Error in S3 uplaod \n", err);
      return res
        .status(500)
        .json({ success: false, message: "Error uploading file" });
    }
    console.log(data);

    res.status(200).json({ data });
  });
});

/* -------------------------------- CASHGRAM -------------------------------- */

app.post("/api/createCashgram", async (req, res) => {
  const { name, number } = req.body;

  const { Payouts } = cfSdk;
  const { Cashgram } = Payouts;

  Payouts.Init({
    ClientID: process.env.CASHFREE_CLIENT_ID,
    ClientSecret: process.env.CASHFREE_CLIENT_SECRET,
    ENV: process.env.NODE_ENV === "production" ? "PRODUCTION" : "TEST",
  });

  const cashgram = {
    cashgramId: uuidv4(),
    amount: process.env.CASHFREE_CASHGRAM_AMT,
    name,
    phone: number,
    linkExpiry: moment().add(4, "days").format("YYYY/MM/DD"), // Here link will be expired after 3 days
    remarks: `payout`,
    notifyCustomer: 1,
  };

  //create cashgram

  try {
    const resp = await Cashgram.CreateCashgram(cashgram);
    console.log("create cashgram response", resp);
    if (resp.status === "SUCCESS") {
      return res
        .status(200)
        .json({ success: true, data: resp.data.cashgramLink });
    }
    return res.status(500).json({ success: false, message: resp.message });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                           crud for google sheets                           */
/* -------------------------------------------------------------------------- */

/* ----------------------- GET Google Sheet method ---------------------- */

app.get("/api/getSheetData", async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  const getSheetData = await googleSheet.spreadsheets.values.get({
    auth,
    spreadsheetId,
    //   range: 'Sheet1!A2:B',
    range: "Sheet1",
  });

  const rows = getSheetData.data.values;
  console.log(rows);
  const headers = rows.shift();
  let data = [];

  data = rows.map((row, idx) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = !!row[index] ? row[index] : "";
    });
    obj.id = idx + 1;

    return obj;
  });

  console.log("arr of obj", data);

  if (req.headers.userid)
    data = data.filter((row) => row.number == req.headers.userid);

  res.status(200).json({
    success: true,
    // metaData: getMetaData,
    data,
  });
});

/* ----------------------- POST Google Sheet method ---------------------- */

app.post("/api/postSheetData", async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);
  const { uploadMonth, uploadDateTime, links, approval, payoutLink } = req.body;

  await googleSheet.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Sheet1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [
        [
          req.headers.userid,
          req.headers.name,
          uploadMonth,
          uploadDateTime,
          links.toString(),
          approval,
          payoutLink,
          ,
        ],
      ],
    },
  });

  res.status(200).json({
    success: true,
    message: "Sucessfully Submitted",
  });
});

/* ----------------------- UPDATE Google Sheet method ---------------------- */

app.post("/api/updateSheetData", async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  const {
    number,
    name,
    uploadMonth,
    uploadDateTime,
    links,
    approval,
    payoutLink,
    id,
  } = req.body;

  await googleSheet.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: `Sheet1!A${id + 1}`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [
        [
          number,
          name,
          uploadMonth,
          uploadDateTime,
          links,
          approval,
          payoutLink,
        ],
      ],
    },
  });

  res.status(200).json({
    success: true,
    message: "Sucessfully Updated",
  });
});

/* ----------------------- DELETE Google Sheet method ---------------------- */

app.post("/api/deleteSheetData", async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  await googleSheet.spreadsheets.values.clear({
    auth,
    spreadsheetId,
    range: "Sheet1",
  });

  res.send("Deleted Successfully");
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

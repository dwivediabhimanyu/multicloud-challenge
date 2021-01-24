require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
var Minio = require("minio");
const uuidv4 = require("uuid").v4;
var firebase = require("firebase");
require("firebase/auth");
require("firebase/firestore");
const { FIREBASE_CONFIG, BUCKET_URI } = require("./config");

var s3Client = new Minio.Client({
  endPoint: "s3.amazonaws.com",
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY,
});

(async () => {
  // Init the Express application
  const app = express();
  //Here we are configuring express to use body-parser as middle-ware.
  app.use(bodyParser.json({ limit: "200mb" }));
  app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  var firebaseConfig = FIREBASE_CONFIG;
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const db = firebase.firestore();

  // Set the network port
  const port = process.env.PORT || 8082;
  app.get("/api/fetch/", async (req, res) => {
    const fileName = req.query.fileName;
    const snapshot = await db.collection("image-analysis").get();
    snapshot.forEach((doc) => {
      if (doc.id == fileName) {
        const data = doc.data();
        res.send(data);
      }
    });
    res.status(404);
    res.send("Image Not Upload. Data Not Found.");
  });

  app.get("/api/", (req, res) => {
    res.send("POST /api/");
  });

  app.post("/api/", async (req, res) => {
    const imageBinary = req.body.binImg;
    const buf = Buffer.from(
      imageBinary.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    var data = {
      ContentEncoding: "base64",
      ContentType: "image/png",
      "X-Amz-Meta-Testing": 1234,
      example: 5678,
    };
    const imgName = uuidv4() + ".png";
    s3Client.putObject(
      process.env.BUCKET_NAME,
      imgName,
      buf,
      data,
      function (err, etag) {
        return console.log(err, etag); // err should be null
      }
    );

    res.status(200);
    res.send({
      imageName: imgName,
    });
  });

  if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));

    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
  }

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
/*
// List all object inside Firestore 

var stream = s3Client.listObjects("store-998160211893-dev", "", true);
stream.on("data", function (obj) {
  console.log(obj);
});
stream.on("error", function (err) {
  console.log(err);
});
*/

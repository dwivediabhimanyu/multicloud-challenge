// Import funtioncs and firebase-admin package
const { computerVision } = require("./lib/azure-services");
const admin = require("firebase-admin");

// TODO: add serviceAccountKey file in root dir
const serviceAccount = require("./serviceAccountKey.json");

exports.handler = async (event) => {
  // Checking if firebase app is already intialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  // Initialize firestore
  const db = admin.firestore();

  // TODO: add BUCKET_URI variable on Lamdba Dashboard.
  const bucketURI = process.env.BUCKET_URI;
  // Handle spaces or unicode non-ASCII characters
  const fileName = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  // Concat filename that triggered Lambda to BucketURI
  const imageUrl = bucketURI + fileName;
  // Calling computerVision api with Public Image URL
  const response = await computerVision(imageUrl).then((item) => {
    return item;
  });

  // Adding response data to firestore
  const docRef = db.collection("image-analysis").doc(fileName);
  await docRef.set({
    url: imageUrl,
    data: response,
  });
};

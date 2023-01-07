// https://cloud.google.com/vision/docs/object-localizer#vision_localize_objects_gcs-nodejs
const dotenv = require('dotenv');    
dotenv.config({ path: __dirname + '/.env' });

const vision = require('@google-cloud/vision');
const {GoogleAuth, grpc} = require('google-gax');

const appBasePath = process.cwd();
const apiKey = process.env.GCLOUD_VISION_API_KEY;

const getApiKeyCredentials = () => {
  const sslCreds = grpc.credentials.createSsl();
  const googleAuth = new GoogleAuth();
  const authClient = googleAuth.fromAPIKey(apiKey);
  const credentials = grpc.credentials.combineChannelCredentials(
    sslCreds,
    grpc.credentials.createFromGoogleCredential(authClient)
  );
  return credentials;
}

const getImageLabels = async (imgPath) => {
  const sslCreds = getApiKeyCredentials();
  const client = new vision.ImageAnnotatorClient({sslCreds});
  const [result] = await client.objectLocalization(imgPath);
  const objects = result.localizedObjectAnnotations;

  // enumerate values
  // objects.forEach(object => {
  //   console.log(`Name: ${object.name}`);
  //   console.log(`Confidence: ${object.score}`);
  //   const veritices = object.boundingPoly.normalizedVertices;
  //   veritices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
  // });

  // return first one for now
  if (objects.length) {
    return objects[0].name;
  } else {
    return false;
  }
}

module.exports = {
  getImageLabels,
};

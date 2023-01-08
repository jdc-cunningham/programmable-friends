const dotenv = require('dotenv');    
dotenv.config({ path: __dirname + '/.env' });

const { getImageLabels } = require('./google_cloud_vision');
const { msgFriend } = require('./openai_friend_chat');
const { twilioSend } = require('./twilio');
const { getImageFromVideo, remoteFileToDisk, deleteFile } = require('./media_util');

const verifySender = body => {
  if (body.From === process.env.MY_NUMBER) {
    return true;
  } else {
    return false;
  }
}

const checkContent = (body, mediaUrl = '', mediaType = '') => {
  if (mediaUrl) {
    if (mediaType.indexOf('video') !== -1) {
      return 'video';
    } else {
      return 'image';
    }
  }

  return 'text';
}

const processMsg = async (contentType, body) => {
  const { Body, MediaContentType0 } = body;

  let response;

  if (contentType === 'text') {
    response = await msgFriend(Body);
  } else if (contentType === 'image') {
    const localImg = await remoteFileToDisk(body.MediaUrl0, MediaContentType0);
    const imgContext = await getImageLabels(localImg);

    if (imgContext) {
      response = await msgFriend(Body + '\n\n' + imgContext);
      deleteFile(localImg); // not a big deal but avoid buildup/security
    }
  } else {
    const localVid = await remoteFileToDisk(body.MediaUrl0, MediaContentType0);
    const vidContext = getImageFromVideo(body.MediaUrl0);

    if (vidContext) {
      response = await msgFriend(Body + '\n\n' + vidContext);
      deleteFile(localVid);
    }
  }
  
  twilioSend(response);
}

module.exports = {
  verifySender,
  checkContent,
  processMsg,
};

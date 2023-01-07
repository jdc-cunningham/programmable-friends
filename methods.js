const dotenv = require('dotenv');    
dotenv.config({ path: __dirname + '/.env' });

const { getImageLabels } = require('./google_cloud_vision');
const { msgFriend } = require('./openai_friend_chat');
const { twilioSend } = require('./twilio');
const { getImageFromVideo } = require('./video_util');

const verifySender = body => {
  if (body.From === process.env.MY_NUMBER) {
    return true;
  } else {
    return false;
  }
}

const checkContent = (body, mediaUrl = '', mediaType = '') => {
  if (body && !mediaUrl) {
    return 'text';
  } else if (body && mediaUrl) {
    if (mediaType.indexOf('video') !== -1) {
      return 'video';
    } else {
      return 'image';
    }
  }
}

const processMsg = async (contentType, body) => {
  const { Body, MediaContentType0 } = body;

  let response;

  if (contentType === 'text') {
    response = await msgFriend(Body);
  } else if (contentType === 'image') {
    const imgContext = getImageLabels(body.mediaUrl0);

    if (imgContext) {
      response = await msgFriend(Body + '\n\n' + imgContext);
    }
  } else {
    const vidContext = getImageFromVideo(body.mediaUrl0);

    if (vidContext) {
      response = await msgFriend(Body + '\n\n' + vidContext);
    }
  }
  
  twilioSend(response);
}

module.exports = {
  verifySender,
  checkContent,
  processMsg,
};

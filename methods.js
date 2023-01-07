const dotenv = require('dotenv');    
dotenv.config({ path: __dirname + '/.env' });

const { getImageLabels } = require('./google_cloud_vision');
const { msgFriend } = require('./openai_friend_chat');
const { twilioSend } = require('./twilio');

const verifySender = body => {
  if (body.From === process.env.MY_NUMBER) {
    return true;
  } else {
    return false;
  }
}

const checkContent = (body, MediaUrl0 = '', MediaContentType0 = '') => {
  if (body && !MediaUrl0) {
    return 'text';
  } else if (body && MediaUrl0) {
    if (MediaContentType0.indexOf('video') !== -1) {
      return 'video';
    } else {
      return 'image';
    }
  }
}

const processMsg = async (contentType, body) => {
  const { Body, MediaUrl0, MediaContentType0 } = body;

  if (contentType === 'text') {
    const response = await msgFriend(Body);
    twilioSend(response);
  }
}

module.exports = {
  verifySender,
  checkContent,
  processMsg,
};

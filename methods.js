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

const checkMsg = (Body, imgData, type) => {
  if (!Body && !imgData) {
    return "What's up"; // fail message
  }

  if (Body && !imgData) {
    return Body;
  }

  let body = Body ? Body + '\n\n' : "";

  if (type === 'video') {
    return body + 'this video has a ' + imgData + ' in it';
  } else {
    return body + 'this image has a ' + imgData + ' in it';
  }
}

const errMsg = () => {
  twilioSend('What is that?'); // if media fails to download/be read
};

const processMsg = async (contentType, body) => {
  const { Body, MediaContentType0 } = body;

  let response;

  if (contentType === 'text') {
    response = await msgFriend(Body);
  } else if (contentType === 'image') {
    const localImg = await remoteFileToDisk(body.MediaUrl0, MediaContentType0);

    if (!localImg) {
      errMsg();
      return;
    }

    const imgContext = await getImageLabels(localImg);

    if (imgContext) {
      response = await msgFriend(checkMsg(Body, imgContext, 'image'));
      deleteFile(localImg); // not a big deal but avoid buildup/security
    }
  } else {
    const localVid = await remoteFileToDisk(body.MediaUrl0, MediaContentType0);

    if (!localVid) {
      errMsg();
      return;
    }

    const vidContext = getImageFromVideo(body.MediaUrl0);

    if (vidContext) {
      response = await msgFriend(checkMsg(Body, vidContext, 'video'));
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

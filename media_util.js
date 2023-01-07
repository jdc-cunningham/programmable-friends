const exec = require('child_process').exec;
const http = require('http');
const fs = require('fs');
const { twilioSend } = require('./twilio');

const appBasePath = process.cwd();

// https://superuser.com/questions/1009969/how-to-extract-a-frame-out-of-a-video-using-ffmpeg
const getImageFromVideo = (videoPath, frameCount = 1) => { // frameCount means multiple, future nice to have
  const cmd = `ffmpeg -i ${videoPath} -vf "select=1" -vframes 1 ${appBasePath}/images/out.png`;

  exec(cmd, function (error, stdout, stderr) {
    if (error) {
      console.log(error);
      return false;
    }
    if (stderr) {
      console.log(stderr);
      return false;
    }
    return true;
  });
}

// https://www.twilio.com/docs/sms/accepted-mime-types
// assumes no audio type is used, rare for me
const getFilePath = (mediaType) => {
  // this assumes last part of mimetype = file extension
  // I was initially iterating over a list of mimetypes but seems redundant

  if (mediaType.indexOf('video') !== -1) {
    return `${appBasePath}/videos/file.${mediaType.split('/')[1]}`;
  } else {
    return `${appBasePath}/images/file.${mediaType.split('/')[1]}`;
  }
}

// https://stackoverflow.com/a/11944984/2710227
const remoteFileToDisk = async (mediaUrl, type) => {
  const filepath = getFilePath(type);
  const file = fs.createWriteStream(filepath);

  return new Promise(resolve => {
    // this is okay since known source, public obfuscated urls
    http.get(mediaUrl, function(response) {
      response.pipe(file);
  
      // after download completed close filestream
      file.on('finish', () => {
          file.close();
          resolve(filepath);
      });

      file.on('error', (err) => {
        console.log(err);
        resolve(false);
      })
    });
  });
}

const deleteFile = filePath => {
  fs.unlink(filePath, (err => {
    if (err) twilioSend('failed to delete file');
  }));
}

module.exports = {
  getImageFromVideo,
  remoteFileToDisk,
  deleteFile,
};

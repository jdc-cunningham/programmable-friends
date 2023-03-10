const exec = require('child_process').exec;
const q = require('q');
const url = require('url');
const fs = require('fs');
const { twilioSend } = require('./twilio');

const appBasePath = process.cwd();

// https://superuser.com/questions/1009969/how-to-extract-a-frame-out-of-a-video-using-ffmpeg
const getImageFromVideo = async (videoPath, frameCount = 1) => { // frameCount means multiple, future nice to have
  return new Promise(resolve => {
    const cmd = `ffmpeg -hide_banner -y -i ${videoPath} -vf "select=1" -vframes 1 ${appBasePath}/images/out.png `;

    exec(cmd, function (error, stdout, stderr) {
      if (error) {
        console.log(error);
        resolve(false);
      }

      if (stderr) {
        console.log(stderr);

        // this technically is an error but it's producing an image still
        setTimeout(() => {
          resolve(`${appBasePath}/images/out.png`);
        }, 3000);
      }

      // wait write to disk, helps with human delay too
      setTimeout(() => {
        resolve(`${appBasePath}/images/out.png`);
      }, 3000);
    });
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

const downloadResolver = async (uri, filename) => {
  return new Promise(resolve => {
    // https://stackoverflow.com/a/40554947/2710227
    const download = (uri, filename, promiseResolver) => {
      var protocol = url.parse(uri).protocol.slice(0, -1);
      var deferred = q.defer();

      var onError = function (e) {
        fs.unlink(filename);
        deferred.reject(e);
        promiseResolver(false);
      }

      require(protocol).get(uri, function(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          var fileStream = fs.createWriteStream(filename);
          fileStream.on('error', onError);
          fileStream.on('close', deferred.resolve);
          response.pipe(fileStream);
          setTimeout(() => {
            promiseResolver(true);
          }, 3000); // dumb wait fully written to disk
        } else if (response.headers.location) {
          deferred.resolve(download(response.headers.location, filename, promiseResolver));
        } else {
          promiseResolver(false);
          deferred.reject(new Error(response.statusCode + ' ' + response.statusMessage));
        }
      }).on('error', onError);

      return deferred.promise;
    };

    download(uri, filename, resolve);
  });
}

const remoteFileToDisk = async (mediaUrl, type) => {
  const filepath = getFilePath(type);

  return new Promise(async resolve => {
    const downloaded = await downloadResolver(mediaUrl, filepath);
    
    if (downloaded) {
      resolve(filepath);
    } else {
      resolve(false);
    }
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

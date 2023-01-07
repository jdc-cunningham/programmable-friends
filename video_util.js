const exec = require('child_process').exec;

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

module.exports = {
  getImageFromVideo,
};

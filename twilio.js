const dotenv = require('dotenv');    
dotenv.config({ path: __dirname + '/.env' });

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken); 

const twilioSend = (msg) => {
  client.messages 
    .create({         
        to: process.env.MY_NUMBER,
        body: msg,
        from: process.env.TWILIO_NUMBER,
      }) 
    .then(message => console.log(message)) 
    .done();
}

module.exports = {
  twilioSend,
};

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

const { verifySender, checkContent, processMsg } = require('./methods');

// CORs
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true
  })
);

app.get('/', (req, res) => {
  res.status(200).send('online');
});

app.post('/programmable-friends', (req, res) => {
  const { body } = req;
  const { Body, MediaUrl0, MediaContentType0 } = body;
  const senderVerified = verifySender(body);

  if (senderVerified) {
    const contentType = checkContent(Body, MediaUrl0, MediaContentType0);
    processMsg(contentType, body);
  }

  res.status(200);
});

app.listen(port, () => {
  console.log(`App running... on port ${port}`);
});
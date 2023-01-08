// need an account
// from: https://beta.openai.com/examples/default-friend-chat?lang=node.js
const dotenv = require('dotenv');    
dotenv.config({ path: __dirname + '/.env' });

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const msgFriend = async (msg) => {
  const prompt = `You: ${msg}\nFriend:`;

  console.log('msg sent: ', prompt);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.5,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    stop: ["You:"],
  });

  // openapi can be busy
  if (response?.data?.error) {
    return "sorry I'm busy atm";
  }

  if (response?.data?.choices) {
    const friendRes = response.data.choices[0].text;

    return friendRes.indexOf('?') !== -1
      ? friendRes.split('?')[1]
      : friendRes;
  } else {
    return "wut"; // default response
  }
}

module.exports = {
  msgFriend,
};

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
var MODEL = "text-davinci-003";

async function makeRequest(prompt, opt) {
  if (!prompt) throw new Error("Missing prompt");
  try {
    var prompt = prompt || "unemployed";
    if (opt && opt.lang) {
      prompt += ` Write the response in ${opt.lang} language, not English`;
    }
    // prompt = null;
    const res = await openai.createCompletion({
      prompt,
      model: MODEL,
      max_tokens: 300,
      temperature: 0.8,
    });
    var data = res.data;
    if (res.status != 200) {
      console.log("OPENAI ERROR", res.status, data);
      throw new Error(
        "Error handling the API call to GPT. Could be a missing API Key, or a problem with the remote API."
      );
    }

    var choice = data.choices[0];
    var t = choice.text;

    // var usage = data.usage;
    console.log("USAGE: ", data.usage);

    //console.log(res, t, "OPE234534534534NN");
    return String(t)
      .trim()
      .replaceAll('""', '"')
      .replace(/^"(.*)"$/, "$1");
  } catch (e) {
    console.log(e);
    throw new Error(
      "Error handling the API call. Could be a missing API Key, or a problem with the API."
    );
  }
}

module.exports = {
  home: async () => {
    return "⚡ Your custom GPT API is working on Midrun ⚡";
  },

  joke: async ({ topic, opt }) => {
    return await makeRequest(
      `Write a hilarious joke about  ${topic}. Ensure it's slightly offensive.`,
      opt
    );
  },

  advice: async ({ job, opt }) => {
    if (!job)
      throw new Error("Missing job parameter. Example: /advice/developer");
    return await makeRequest(
      `Write a purposefully wrong career advice for someone who's job is:  ${job}.  In a sarcastic tone, fake-pretend AI could never be replacing them and taking their job. Insinuate AI and the future is definately be threat to their career. Give a specefic example of task. Ensure it's offensive, insulting,  induce some fear with heavy sarcasm. Keep to sarcastic and punchy.  `,
      opt
    );
  },
  //reference other 'advice' function
  guitarChordProgression: async ({ opt }) => {
    var key = opt.key || "E";
    return await makeRequest(
      `Write a ${opt.style} chord progression, with chord names (not numerals) in the key of ${key}. It should sounds good and is fun to play.`,
      opt
    );
  },
};

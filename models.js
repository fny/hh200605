require('dotenv').config()

exports.vicuna = {
  hyperparamSchema: {
    type: 'object',
    properties: {
      max_length: { type: 'integer' },
      temperature: { type: 'number' },
      top_p: { type: 'number' },
      repetition_penalty: { type: 'number' },
      seed: { type: 'integer' },
    },
  },
  run: async (prompt, hyperparameters) => {
    const Replicate = require("replicate");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "replicate/vicuna-13b:6282abe6a492de4145d7bb601023762212f9ddbbe78278bd6771c8b3b2f2a13b",
      {
        input: {
          prompt,
          ...hyperparameters,
        }
      }
    );
    return output.join("");
  }
}

exports.gpt3 = {
  hyperparamSchema: {
    type: 'object',
    properties: {
      suffix: { type: 'string' },
      max_tokens: { type: 'integer' },
      temperature: { type: 'number' },
      top_p: { type: 'number' },
      n: { type: 'integer' },
      stream: { type: 'boolean' },
      logprobs: { type: 'integer' },
      echo: { type: 'boolean' },
      stop: { type: 'string' },
      presence_penalty: { type: 'number' },
      frequency_penalty: { type: 'number' },
      best_of: { type: 'integer' },
    },
  },
  run: async (prompt, hyperparameters) => {
    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      ...hyperparameters,
    });
    return response.data.choices[0].text
  }
}

exports.command = {
  hyperparamSchema: {
    type: 'object',
    properties: {
      num_generations: { type: 'integer' },
      max_tokens: { type: 'integer' },
      temperature: { type: 'number' },
      k: { type: 'integer' },
      p: { type: 'number' },
      frequency_penalty: { type: 'number' },
      presence_penalty: { type: 'number' },
      end_sequences: { type: 'array', items: { type: 'string' } },
      stop_sequences: { type: 'array', items: { type: 'string' } },
    },
  },
  run: async (prompt, hyperparameters) => {
    const axios = require('axios');

    const options = {
      method: 'POST',
      url: 'https://api.cohere.ai/v1/generate',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.COHERE_API_KEY}`
    },
      data: {
        prompt,
        model: 'command',
        ...hyperparameters
      }
    };

    const response = await axios.request(options)
    return response.data.generations[0].text
  }
}

exports.chatgpt3 = {
  hyperparamSchema: {
    type: 'object',
    properties: {
      suffix: { type: 'string' },
      max_tokens: { type: 'integer' },
      temperature: { type: 'number' },
      top_p: { type: 'number' },
      n: { type: 'integer' },
      logprobs: { type: 'integer' },
      echo: { type: 'boolean' },
      stop: { type: 'string' },
      presence_penalty: { type: 'number' },
      frequency_penalty: { type: 'number' },
      best_of: { type: 'integer' },
    },
  },
  run: async (messages, hyperparameters) => {
    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      ...hyperparameters,
    });
    return response.data.choices[0].message.content
  }
}

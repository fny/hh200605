const fastify = require('fastify')({ logger: true })
const models = require('./models')
const database = require('./database')
const validate = require('jsonschema').validate;

fastify.route({
  method: 'POST',
  url: '/create_prompt',
  schema: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string'},
        prompt_template: { type: 'string' },
        model: { type: 'string' },
        hyperparameters: { type: 'object' },
      },
      required: ['name', 'prompt_template', 'model'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
        }
      }
    }
  },
  handler: async (request, reply) => {
    const { name, prompt_template, model, hyperparameters } = request.body
    // check model exists
    const modelDetails = models[model]
    if (!modelDetails) {
      reply.code(400).send({ success: false, error: 'model not found' })
      return
    }

    // validate hyperparameters
    const hyperparamSchema = modelDetails.hyperparamSchema

    const validation = validate(hyperparameters, hyperparamSchema)
    if (!validation.valid) {
      reply.code(400).send({ success: false, error: validation.errors })
      return
    }

    database.set(name, { prompt_template, model, hyperparameters })
    return { success: true }
  }
})

fastify.route({
  method: 'POST',
  url: '/create_completion',
  schema: {
    body: {
      type: 'object',
      properties: {
        prompt_name: { type: 'string' },
        variables: { type: 'object' },
      },
      required: ['prompt_name'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          prompt: { type: 'string' },
          response: { type: 'string' },
        }
      }
    }
  },
  handler: async (request, reply) => {
    const { prompt_name, variables } = request.body
    // check prompt exists
    const prompt = database.get(prompt_name)
    if (!prompt) {
      reply.code(400).send({ success: false, error: 'prompt not found' })
      return
    }

    let promptTemplate = prompt.prompt_template

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        promptTemplate = promptTemplate.replace(`{{${key}}}`, value)
      })
    }

    const model = models[prompt.model]
    if (!model) {
      reply.code(400).send({ success: false, error: 'Model not found' })
      return
    }

    try {
      const response = await model.run(promptTemplate, prompt.hyperparameters)
      return { success: true, prompt: promptTemplate, response }
    } catch (e) {
      console.error("Error running model!", e)
      reply.code(400).send({ success: false, error: e })
    }
  }
})

const chatHistory = []

fastify.route({
  method: 'POST',
  url: '/chat',
  schema: {
    body: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        hyperparameters: { type: 'object' },
      },
      required: ['prompt'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          prompt: { type: 'string' },
          response: { type: 'string' },
          hyperparameters: { type: 'object' },
        }
      }
    }
  },
  handler: async (request, reply) => {
    chatHistory.push({
      role: 'user', content: request.body.prompt
    })
    hyperparameters = request.body.hyperparameters || {}
    const response = await models.chatgpt3.run(chatHistory, hyperparameters)

    chatHistory.push({
      role: 'assistant', content: response
    })

    return { success: true, prompt: request.body.prompt, response }
  }
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

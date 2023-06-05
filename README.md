# Usage

Create a dotenv file with the following keys.

```
REPLICATE_API_TOKEN=
OPENAI_API_KEY=
COHERE_API_KEY=
```

Start the server with `node index.js`

Make post requests to `localhost:3000/create_prompt` to create a prompt. The body of the request should include the complete payload.

```
POST /create_prompt
{
	"name": "test_command",
	"prompt_template": "I want you to act as a naming consultant for new companies.\n\nWhat is a good name for a company that makes ?",
	"model": "command",
    "hyperparameters": { ... }
}

# => { "success": true }
```

Note this will create an entry in `database.json` the dummy database used for this exercise.

Make post requests to `localhost:3000/create_completition` to return a completition. Again, the body of the request should contain the complete payload.

```
POST /create_completeion
{
	"prompt_name": "test_command",
	"variables": {
		"product": "apples"
	}
}

# => { "success": true, "response": ... }
```

## ChatGPT

You can chat with a single instance of ChatGPT by invoking the following:

```
POST /chat
{
    "prompt": "My favorite color is yellow. What is your favorite color?",
    "hyperparameters": ...
}

POST /chat
{
    "prompt": "What is my favorite color?"
    "hyperparameters": ...
}
```

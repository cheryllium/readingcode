require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

app.use(express.static('build'))

const { Configuration, OpenAIApi } = require('openai')
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

console.log('API_KEY', process.env.OPENAI_API_KEY)

app.post('/check', async (request, response) => {
  const answers = request.body.answers

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: "You are a programming professor who needs to grade an assignment. An English explanation was given for each of the lines of code below. For each explanation, say either true if the explanation is accurate, or false if it is inaccurate. Here are some examples: let sum = 2 + 3, if the student answers with '5', you should say it is incorrect as they simply wrote a value instead of describing the code. If the student answers 'let sum = 5', this is incorrect because they have written code instead of describing in English. The student should say something like 'assign the value 5 to the variable sum'. for(let i=0; i<15; i++), if the student says 'for i from 0 to 15', they are incorrect because the loop actually stops before 15, and goes to 14 instead. In your comments, be careful to not give out the answer, but simply give a hint. \n" + answers.map(answer => {
          return `"${answer.line}" explanation is: ${answer.answer}\n`
        })
      }
    ],
    functions: [
      {
        name: "gradeAssignment",
        description: "Grade the assignment",
        parameters: {
          'type': 'object',
          'properties': {
            'grades': {
              'type': 'array',
              'items': {
                'type': 'object',
                'properties': {
                  'line': {
                    'type': 'string',
                    'description': 'The line of code being graded'
                  },
                  'correct': {
                    'type': 'boolean',
                    'description': 'Whether the given English explanation was correct'
                  },
                  'comments': {
                    'type': 'string',
                    'description': 'Comments on why the student answer was correct or incorrect'
                  }
                }
              }
            }
          }
        }
      }
    ]
  })

  const completionResponse = completion.data.choices[0].message
  if(!completionResponse.content) {
    const completionArguments = JSON.parse(completionResponse.function_call.arguments)
    return response.json(completionArguments)
  } else {
    const completionText = completion.data.choices[0].message.content
    console.log('completionText received', completionText)
    response.status(500).json({ error: "Invalid response received from ChatGPT API" })
  }
})

app.listen(3001, () => {
  console.log('Server running on port 3001')
})

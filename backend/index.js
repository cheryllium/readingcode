require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

const { Configuration, OpenAIApi } = require('openai')
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

app.post('/check', async (request, response) => {
  const answers = request.body.answers

  /* // hard-coded response when I don't want to make an API call (for testing)
  return response.json({
    grades: [
      {
        line: 'for(let i=0; i<15; i++) {',
        correct: true,
        comments: 'The explanation accurately states that the for loop iterates for i from 0 to 15'
      },
      {
        line: 'if(i % 5 === 0) {',
        correct: false,
        comments: 'The explanation is inaccurate'
      },
      {
        line: 'console.log(i)',
        correct: true,
        comments: 'The explanation is true'
      }
    ]
  })
  */
  
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: "An English explanation was given for each of the lines of code below. For each explanation, say either true if the explanation is accurate, or false if it is inaccurate. Be lenient in your grading and try to judge if the student had the right idea in mind instead of being too strict about the details. In your comments, respond as if you are talking directly to the student, taking a friendly tone and using the words you and your. \n" + answers.map(answer => {
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
    console.log('completionText', completionText)
  }

  response.send('<h1>hello world</h1>')
})

app.listen(3001, () => {
  console.log('Server running on port 3001')
})

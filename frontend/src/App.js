import { useState } from 'react'
import './App.css'

import apiService from './services/api'

const levels = [
  `let sum = 2 + 3;`,
  `let sum = 1 + 2 + 3 + 4 + 5;
if(sum > 20) {
  console.log("wow!");
}`,
  `for(let i=0; i<=15; i++) {
  if(i % 5 === 0) {
    console.log(i)
  }
}`,
  `let sum = 0;
for(let i=0; i<=20; i++) {
  sum += i;
}
console.log(sum)`,
  `let a = 30;
let b = 40;
let c = a
a = b
b = c`,
  `function sum(a, b) {
  return a + b;
}
let i = sum(3, 4);
console.log(i)`,
  `function closeToZero(a) {
  return Math.abs(a) < 5;
}`,
  `function foo(a) {
  if(a == 0) {
    return 0; 
  }
  return a + foo(a - 1);
}`,
]

const Line = ({ line, answer, grade, setAnswer, loading }) => {
  return (
    <div className="line">
      <code>{line}</code>
      {/\w/.test(line)
        ? <input type='text'
          value={answer ? answer : ''}
          disabled={loading}
          onChange={e => setAnswer(e.target.value)}
        />
        : <></>}
      <span>
      {grade
        && <>
          <b className={grade.correct ? "correct" : "incorrect"}>
            {grade.correct ? "Correct" : "Incorrect"}
          </b>
          {grade.comments && ` - ${grade.comments}`}
        </>
      }
      </span>
    </div>
  )
}

const App = () => {
  const [level, setLevel] = useState(0)
  const [lineAnswers, setLineAnswers] = useState({})
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [canMoveOn, setCanMoveOn] = useState(false)

  const levelLines = levels[level].split(/\r?\n/)

  const handleSetLineAnswer = (lineIndex, answer) => {
    setLineAnswers({ ...lineAnswers, [lineIndex]: answer })
  }

  const handleCheckAnswers = (event) => {
    event.preventDefault()

    setLoading(true)

    const answers = Object.entries(lineAnswers)
      .sort((a, b) => a[0] > b[0])
      .map(elem => {
        return {
          line: levelLines[Number(elem[0])].trim(),
          answer: elem[1]
        }
      })

    apiService.check({ answers })
      .then(
        data => {
          setGrades(data.grades)

          const allCorrect = data.grades.reduce((acc, v) => acc && v.correct, true)
          console.log(allCorrect)
          if (allCorrect) {
            setCanMoveOn(true)
          }

          setLoading(false)
        }
      )
      .catch(error => {
        setLoading(false)
        alert('Sorry - There was a problem with the response from the ChatGPT API.')
      })
  }

  const goToNextLevel = (event) => {
    event.preventDefault()

    setLineAnswers({})
    setGrades([])
    setCanMoveOn(false)
    setLevel(level + 1)
  }

  return (
    <div className="main">
      <form>
      <h1>Reading Code</h1>
      <p>Try to rewrite each line of code below in plain English. Can you pass all {levels.length} levels?</p>

      <h2>Level {level + 1} <span>(out of {levels.length})</span></h2>
      <div className="program">
        {levelLines.map((line, index) => (
          <Line line={line}
            answer={lineAnswers[index]}
            grade={grades.find(g => g.line.trim() === line.trim()) || null}
            setAnswer={answer => handleSetLineAnswer(index, answer)}
            loading={loading}
            key={index} />
        ))}
      </div>
      <button onClick={handleCheckAnswers} disabled={loading}>Check answers {loading && <div className="lds-ring"><div></div><div></div><div></div><div></div></div>}</button>
      {(canMoveOn && level + 1 < levels.length) && <button onClick={goToNextLevel} disabled={loading}>Next level</button>}
      {canMoveOn && level + 1 === levels.length && <div className="victory">🎉 <span className="correct"><b>You did it!</b></span> Congratulations on completing all of the levels! 🎉</div>}
      </form>
      <footer><a href="https://github.com/cheryllium/readingcode">Github</a> | Made with <a href="https://platform.openai.com/docs/api-reference">ChatGPT API</a></footer>
    </div>
  )
}

export default App;

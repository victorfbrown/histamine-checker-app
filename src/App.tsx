import { useState, type KeyboardEvent } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { neon } from '@neondatabase/serverless';
const DB_URL: string = import.meta.env.VITE_NETLIFY_DATABASE_URL
const CORRECT_PASSWORD : string = import.meta.env.VITE_CORRECT_PASSWORD
const sql = neon(DB_URL);
const [post] = await sql`SELECT * FROM playing_with_neon`;

function App() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = event.target.value;
    setInputValue(newInputValue)
  }

  const handleEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      validateInput()
    }
  }

  const validateInput = () => {
    const isCorrectPassword = inputValue === CORRECT_PASSWORD
    if (isCorrectPassword) {
      alert(`hi ${CORRECT_PASSWORD}!`)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <div className="card">
        <input type="text" onChange={handleChange} onKeyDown={handleEnter} />
      </div>
      <div>
        <button onClick={validateInput}>Click me</button>
      </div>
    </>
  )
}

export default App

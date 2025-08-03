import { useState, type KeyboardEvent } from 'react'
import './App.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
const CORRECT_PASSWORD: string = import.meta.env.VITE_CORRECT_PASSWORD

function Home() {
    const [inputValue, setInputValue] = useState('')
    const { login } = useAuth();
    const navigate = useNavigate();

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
            login();
            navigate('/classify')
        }
    }

    return (
        <>
            <h1>Vite + React</h1>
            <div className="card">
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

export default Home

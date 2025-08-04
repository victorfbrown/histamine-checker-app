import { useState, useEffect } from 'react'
import './App.css'
// import { neon } from '@neondatabase/serverless';
// const DB_URL: string = import.meta.env.VITE_NETLIFY_DATABASE_URL
// const CORRECT_PASSWORD : string = import.meta.env.VITE_CORRECT_PASSWORD
// const sql = neon(DB_URL);
// const [post] = await sql`SELECT * FROM playing_with_neon`;


function classifyIngredient(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    const rejectIngredient = ["arrowleft", "a"].includes(key)
    const acceptIngredient = ["arrowright", "d"].includes(key)
    if (rejectIngredient) {
        console.log('rejecting - ', key)
    } else if (acceptIngredient) {
        console.log('accepting - ', key)
    }
}

function Classify() {

    const [isClassifying, setIsClassifying] = useState(false)
    useEffect(() => {
        if (isClassifying) {
            document.addEventListener('keydown', classifyIngredient);
        }
        return () => {
            document.removeEventListener('keydown', classifyIngredient);
        };
    }, [isClassifying]);


    return (
        <>
            <h1> {isClassifying ? "Ingredient" : "Placeholder"} </h1>
            <br></br>
            <br></br>
            <br></br>
            <br></br>

            <div className="card">
                <button onClick={() => setIsClassifying((isClassifying) => !isClassifying)}>
                    {isClassifying ? "Stop Classifying" : "Classify"}
                </button>
            </div>
        </>
    )
}

export default Classify

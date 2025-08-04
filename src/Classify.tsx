import { useState, useEffect } from 'react'
import './App.css'
import { neon } from '@neondatabase/serverless';
const DB_URL: string = import.meta.env.VITE_NETLIFY_DATABASE_URL
const DB_NAME: string = 'histamine_checker'
const sql = neon(DB_URL);
import { ingredients } from './utils/ingredients';
const first300 = ingredients.map((val) => `('${val}')`).slice(0,2)
// console.log(first300)
// for (let i = 0; i < first300.length; i++) {
//     // const [testIngredients] = await sql.query(`INSERT INTO ${DB_NAME} (ingredient) VALUES ${first300[i]};`)
//     console.log(`INSERT INTO ${DB_NAME} (ingredient) VALUES ${first300[i]};`)
// }
// const [testIngredients] = await sql.query(`INSERT INTO ${DB_NAME} (ingredient) VALUES ;`)
// console.log(`INSERT INTO ${DB_NAME} (ingredient) VALUES ('saaaalt');`)


async function classifyIngredient(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    const rejectIngredient = ["arrowleft", "a"].includes(key)
    const acceptIngredient = ["arrowright", "d"].includes(key)
    if (rejectIngredient) {
        console.log('rejecting - ', key)
    } else if (acceptIngredient) {
        console.log('accepting - ', key)
        // const [maxNumber] = await sql`SELECT max(id) from histamine_checker`
        // console.log(maxNumber)
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

    // useEffect(() => {
    //     for (let i = 0; i < first300.length; i++) {
    //         const [testIngredients] = await sql.query(`INSERT INTO ${DB_NAME} (ingredient) VALUES ${first300[i]};`)
    //         console.log(`INSERT INTO ${DB_NAME} (ingredient) VALUES ${first300[i]};`)
    //     }
    // }, [])


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

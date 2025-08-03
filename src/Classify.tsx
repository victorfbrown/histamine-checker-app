import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import { neon } from '@neondatabase/serverless';
// const DB_URL: string = import.meta.env.VITE_NETLIFY_DATABASE_URL
// const CORRECT_PASSWORD : string = import.meta.env.VITE_CORRECT_PASSWORD
// const sql = neon(DB_URL);
// const [post] = await sql`SELECT * FROM playing_with_neon`;

function Classify() {

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
    </>
  )
}

export default Classify

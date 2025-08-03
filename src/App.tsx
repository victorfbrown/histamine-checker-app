import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './utils/AuthProvider';
import ProtectedRoutes from './utils/ProtectedRoutes';
import Home from './Home';
import Classify from './Classify';


function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classify" element={
            <ProtectedRoutes>
              <Classify />
            </ProtectedRoutes>
          } />
        </Routes>
      </Router>
    </AuthProvider>

  )
}

export default App

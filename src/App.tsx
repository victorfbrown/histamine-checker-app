import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import ClassifiedIngredients from './ClassifiedIngredients';
import Classify from './Classify';
import Home from './Home';
import { AuthProvider } from './utils/AuthProvider';
import ProtectedRoutes from './utils/ProtectedRoutes';


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
          <Route path="/classified" element={
            <ProtectedRoutes>
              <ClassifiedIngredients />
            </ProtectedRoutes>
          } />
        </Routes>
      </Router>
    </AuthProvider>

  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login'
import Register from './Pages/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/internships" element={<div>Internships Page</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login'
import Register from './Pages/Register'
import ForgotPassword from './Pages/ForgotPassword'
import Jobs from './Pages/Jobs'
import ApplicationForm from './Pages/ApplicationForm'
import AdminApplications from './Pages/AdminApplications'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/apply/:jobId" element={<ApplicationForm />} />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute adminOnly>
              <AdminApplications />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

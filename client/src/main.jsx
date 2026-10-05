import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
<<<<<<< HEAD
import ForgotPassword from './pages/Forgotpassword.jsx'
import ResumeUpload from './pages/ResumeUpload.jsx'
=======
import History from './pages/History.jsx'
>>>>>>> 46dd79eeafac3996ef2001a3c5debd58026a2db4

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/forgotPassword",
    element: <ForgotPassword />,
  },
  {
    path: "/ResumeUpload",
    element: <ResumeUpload />,
  },
  {
    path: "/",
    // errorElement: <Error />,
    element: <App />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/history",
        element: <History />,
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)

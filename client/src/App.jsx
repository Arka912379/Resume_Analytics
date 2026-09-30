import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import { Suspense } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx'

function App() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Sidebar />
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </div>
  )
}

export default App
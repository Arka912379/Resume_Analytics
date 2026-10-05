import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import { Suspense } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx'

function App() {
  return (
    <div className="flex h-screen w-full items-start overflow-hidden">
      <Sidebar className="sticky top-0 self-start" />
      <Navbar />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

export default App

import { Outlet, useLocation } from 'react-router-dom'
import { Suspense, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx'

function App() {
  const { pathname } = useLocation()
  const [interviewLocked, setInterviewLocked] = useState(false)
  return (
    <div className="flex h-screen w-full items-start overflow-hidden">
      {!(pathname === '/interview' && interviewLocked) && <Sidebar className="sticky top-0 self-start" />}
      {pathname !== '/interview' && <Navbar />}
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet context={{ setInterviewLocked }} />
        </Suspense>
      </main>
    </div>
  )
}

export default App

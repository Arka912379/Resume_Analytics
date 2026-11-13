import { useCallback, useEffect, useState } from 'react'
import { Calendar, FileClock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ATSScoreCard from '../components/Atsscorecard.jsx'
import BarsIcon from '../components/BarsIcon.jsx'
import QuickActions from '../components/Quickactions.jsx'
import RecentActivity from '../components/RecentActivity.jsx'
import StatCard from '../components/Statcard.jsx'
import { dashboardApi } from '../services/dashboardApi.js'

// The "WELCOME BACK, NAME!" heading, bell and user chip are rendered by the
// existing fixed <Navbar />, so this page only draws the content below it.

const padCount = (value) => String(value).padStart(2, '0')

// dot grid + staircase from the reference (desktop only, purely decorative)
function Decorations() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[350px] top-[97px] hidden h-[85px] w-[125px] bg-[radial-gradient(circle,#111_1.6px,transparent_2px)] [background-size:20px_20px] xl:block"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 233 123"
        className="pointer-events-none absolute right-0 top-[92px] hidden h-[123px] w-[233px] xl:block"
      >
        <rect x="113" y="0" width="120" height="123" fill="#7c5cff" />
        <rect x="90" y="0" width="23" height="123" fill="#111" />
        <rect x="60" y="31" width="30" height="92" fill="#111" />
        <rect x="30" y="63" width="30" height="60" fill="#111" />
        <rect x="0" y="95" width="30" height="28" fill="#111" />
      </svg>
    </>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setError('')
      setData(await dashboardApi.getDashboard())
    } catch (err) {
      setError(err.message || 'Could not load your dashboard.')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const atsMenu = [
    { label: 'Analyze resume', onSelect: () => navigate('/ResumeUpload') },
    { label: 'View history', onSelect: () => navigate('/history') },
    { label: 'Refresh', onSelect: load },
  ]

  return (
    <div className="relative isolate min-h-screen w-full min-w-0 flex-1 overflow-hidden bg-[#f7f7f7] px-4 pb-8 pt-36 text-[#111] sm:px-6 lg:pr-10 lg:pt-[216px]">
      <Decorations />

      {!data && error && (
        <div role="alert" className="relative z-10 max-w-xl border-2 border-[#111] bg-red-200 p-5 shadow-[6px_6px_0_#111]">
          <p className="font-extrabold">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 border-2 border-[#111] bg-white px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_#111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Try again
          </button>
        </div>
      )}

      {!data && !error && (
        <p className="relative z-10 inline-block border-2 border-[#111] bg-[#b290ff] px-5 py-3 font-black shadow-[5px_5px_0_#111]">
          Loading dashboard...
        </p>
      )}

      {data && (
        <div className="relative z-10 flex flex-col gap-7">
          <div className="grid gap-7 lg:grid-cols-[1.16fr_1fr]">
            <ATSScoreCard score={data.atsScore} menuItems={atsMenu} />
            <QuickActions />
          </div>

          <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Interviews Taken"
              icon={FileClock}
              iconBg="bg-[#8f72f7]"
              color="#7c5cff"
              value={data.interviews.value}
              points={data.interviews.history}
              formatValue={padCount}
              formatTooltip={(v) => `${v} ${v === 1 ? 'interview' : 'interviews'}`}
            />
            <StatCard
              label="Average Score"
              icon={BarsIcon}
              iconBg="bg-[#ffe74a]"
              color="#f5c800"
              value={data.averageScore.value}
              points={data.averageScore.history}
              formatValue={(v) => `${v}%`}
            />
            <StatCard
              label="Days Active"
              icon={Calendar}
              iconBg="bg-[#8f72f7]"
              color="#7c5cff"
              value={data.daysActive.value}
              points={data.daysActive.history}
              formatValue={(v) => String(v)}
              formatTooltip={(v) => `${v} ${v === 1 ? 'day' : 'days'}`}
            />
          </div>

          <RecentActivity items={data.recentActivity} />
        </div>
      )}
    </div>
  )
}
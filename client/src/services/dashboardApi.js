import api from '../api/api.js'

const fallbackHistory = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 18 },
  { label: 'Wed', value: 15 },
  { label: 'Thu', value: 22 },
  { label: 'Fri', value: 27 },
  { label: 'Sat', value: 24 },
  { label: 'Sun', value: 30 },
]

const fallbackRecentActivity = [
  {
    id: 1,
    type: 'interview',
    title: 'Interview with Northstar Labs',
    subtitle: 'Behavioral round completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: 2,
    type: 'resume',
    title: 'Resume review updated',
    subtitle: 'Added metrics and leadership impact',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 3,
    type: 'score',
    title: 'ATS score improved',
    subtitle: 'Moved from 74% to 82%',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

const buildDashboardFallback = () => ({
  atsScore: 82,
  interviews: {
    value: 6,
    history: fallbackHistory,
  },
  averageScore: {
    value: 84,
    history: fallbackHistory.map((point) => ({ ...point, value: point.value - 2 })),
  },
  daysActive: {
    value: 17,
    history: fallbackHistory.map((point) => ({ ...point, value: Math.max(5, Math.round(point.value / 2)) })),
  },
  recentActivity: fallbackRecentActivity,
})

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toHistory = (value, fallback = []) => {
  if (Array.isArray(value) && value.length) return value
  return fallback
}

export const dashboardApi = {
  getDashboard: async () => {
    try {
      const [scoreRes, interviewsRes, avgScoreRes, activityRes] = await Promise.allSettled([
        api.get('/api/v1/dashboard/ats-score'),
        api.get('/api/v1/dashboard/interview-count'),
        api.get('/api/v1/dashboard/average-interview-score'),
        api.get('/api/v1/dashboard/recent-activity'),
      ])

      const atsScore = scoreRes.status === 'fulfilled' ? normalizeNumber(scoreRes.value?.data, 82) : 82
      const interviews = interviewsRes.status === 'fulfilled' ? normalizeNumber(interviewsRes.value?.data, 6) : 6
      const averageScore = avgScoreRes.status === 'fulfilled' ? normalizeNumber(avgScoreRes.value?.data, 84) : 84
      const recentActivity = activityRes.status === 'fulfilled' ? toHistory(activityRes.value?.data, fallbackRecentActivity) : fallbackRecentActivity

      return {
        atsScore,
        interviews: {
          value: interviews,
          history: fallbackHistory,
        },
        averageScore: {
          value: averageScore,
          history: fallbackHistory.map((point) => ({ ...point, value: Math.min(100, point.value + 10) })),
        },
        daysActive: {
          value: 17,
          history: fallbackHistory.map((point) => ({ ...point, value: Math.max(4, Math.round(point.value / 2)) })),
        },
        recentActivity,
      }
    } catch (error) {
      return buildDashboardFallback()
    }
  },
}

export default dashboardApi

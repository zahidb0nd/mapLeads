import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, Building2, Bookmark, Zap, MapPin, RefreshCw,
  Clock, ArrowRight, TrendingUp, TrendingDown,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts'
import { format, subDays, formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCardSkeleton } from '@/components/ui/skeleton'
import useStore from '@/stores/useStore'
import { usePageTitle } from '@/hooks/usePageTitle'

// Animated count-up hook
function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (!target) { setCount(0); return }
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [target, duration])
  return count
}

const DONUT_COLORS = ['#7C3AED', '#9F67FF', '#C4A7FF', '#10B981', '#F59E0B']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border p-3 shadow-card text-sm" style={{ background: '#13111C', borderColor: '#2E2A45' }}>
      <p className="text-text-muted mb-1">{label}</p>
      <p className="font-semibold text-text-primary">{payload[0].value} searches</p>
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border p-3 shadow-card text-sm" style={{ background: '#13111C', borderColor: '#2E2A45' }}>
      <p className="font-semibold text-text-primary">{payload[0].name}</p>
      <p className="text-text-muted">{payload[0].value} businesses</p>
    </div>
  )
}

function StatCard({ icon: Icon, iconColor, bgColor, label, value, change, subLabel }) {
  const animated = useCountUp(value)
  const isUp = change >= 0
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5 flex items-center justify-center" style={{ background: bgColor }}>
            <Icon className="h-5 w-5" style={{ color: iconColor }} aria-hidden="true" />
          </div>
          <span className="text-sm text-text-muted font-medium">{label}</span>
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isUp ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-extrabold text-text-primary tabular-nums">{animated.toLocaleString()}</p>
        {subLabel && <p className="text-xs text-text-muted mt-1">{subLabel}</p>}
      </div>
    </Card>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user, stats, searchHistory, savedSearches, setSearchFilters, loadStats } = useStore()
  const navigate = useNavigate()
  usePageTitle('Dashboard')

  const [loadingStats, setLoadingStats] = useState(!stats)

  useEffect(() => {
    if (!stats) {
      loadStats().finally(() => setLoadingStats(false))
    } else {
      setLoadingStats(false)
    }
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'there'

  // Build area chart data (last 30 days)
  const areaData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const count = searchHistory.filter(s => s.created?.startsWith(dateStr)).length
    return { date: format(date, 'MMM d'), count }
  })

  // Build donut data from history categories
  const categoryMap = {}
  searchHistory.forEach(s => {
    const cat = s.query || 'All'
    categoryMap[cat] = (categoryMap[cat] || 0) + (s.results_count || 0)
  })
  const donutData = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))

  const totalBusinesses = donutData.reduce((a, b) => a + b.value, 0)

  const recentSearches = searchHistory.slice(0, 5)

  const handleRerun = (search) => {
    setSearchFilters({
      query: search.query,
      location: search.location,
      latitude: search.latitude,
      longitude: search.longitude,
      radius: search.radius,
      categories: search.categories || [],
    })
    navigate('/search')
  }

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">
          {getGreeting()} 👋
          <span className="block md:inline md:ml-2">{firstName}</span>
        </h1>
        <p className="text-text-secondary mt-1">
          You've found{' '}
          <span className="text-success font-semibold">{(stats?.totalBusinesses || 0).toLocaleString()}</span>
          {' '}businesses without a website so far.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={Search}
              iconColor="#7C3AED"
              bgColor="#7C3AED15"
              label="Total Searches"
              value={stats?.totalSearches || searchHistory.length}
              change={12}
            />
            <StatCard
              icon={Building2}
              iconColor="#10B981"
              bgColor="#10B98115"
              label="Businesses Found"
              value={stats?.totalBusinessesFound || 0}
              change={8}
            />
            <StatCard
              icon={Bookmark}
              iconColor="#F59E0B"
              bgColor="#F59E0B15"
              label="Saved Searches"
              value={savedSearches.length}
              change={0}
            />
            <StatCard
              icon={Zap}
              iconColor="#7C3AED"
              bgColor="#7C3AED15"
              label="Today"
              value={stats?.todaySearches || 0}
              subLabel="3 of 5 used today"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-text-primary mb-4">Searches (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#1E1A30" strokeDasharray="4 4" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B6494', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#7C3AED"
                strokeWidth={2}
                fill="url(#purpleGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Donut chart */}
        <Card>
          <h3 className="text-base font-semibold text-text-primary mb-4">Results by Category</h3>
          {donutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Building2 className="h-10 w-10 text-text-muted mb-2" />
              <p className="text-sm text-text-muted">No data yet</p>
            </div>
          )}
          {/* Centre label overlay is not easily done with recharts inline, skip */}
          {donutData.length > 0 && (
            <div className="mt-3 space-y-1">
              {donutData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  <span className="text-text-muted truncate">{d.name}</span>
                  <span className="ml-auto text-text-secondary font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Searches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Recent Searches</h2>
          <Link to="/history" className="flex items-center gap-1 text-sm text-purple hover:text-purple-light transition-colors">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentSearches.length === 0 ? (
          <Card className="text-center py-12">
            <Clock className="h-12 w-12 text-text-muted mx-auto mb-3" aria-hidden="true" />
            <p className="text-text-primary font-semibold mb-1">No searches yet</p>
            <p className="text-text-muted text-sm mb-4">Start by searching for a city below</p>
            <Button onClick={() => navigate('/search')}>
              <Search className="h-4 w-4" />
              Go to Search
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentSearches.map((search) => (
              <Card key={search.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MapPin className="h-4 w-4 text-purple flex-shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-text-primary text-sm truncate">{search.location}</span>
                    {search.query && (
                      <Badge variant="purple">{search.query}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-success">
                      <Building2 className="h-3 w-3" aria-hidden="true" />
                      {search.results_count || 0} found
                    </span>
                    <span className="text-xs text-text-muted">
                      {search.created ? formatDistanceToNow(new Date(search.created), { addSuffix: true }) : ''}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRerun(search)}
                  className="flex-shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-run
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Saved Searches */}
      {savedSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Saved Searches</h2>
            <Link to="/saved-searches" className="flex items-center gap-1 text-sm text-purple hover:text-purple-light transition-colors">
              Manage <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            {savedSearches.slice(0, 3).map((s) => (
              <Card key={s.id} className="flex-shrink-0 w-64 md:w-auto p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bookmark className="h-4 w-4 text-warning" aria-hidden="true" />
                  <span className="font-semibold text-text-primary text-sm truncate">{s.name || s.query || 'Saved Search'}</span>
                </div>
                <div className="text-xs text-text-muted mb-3">
                  <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</p>
                  {s.query && <p className="mt-1">{s.query}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => handleRerun(s)}
                >
                  <RefreshCw className="h-3 w-3" />
                  Re-run
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

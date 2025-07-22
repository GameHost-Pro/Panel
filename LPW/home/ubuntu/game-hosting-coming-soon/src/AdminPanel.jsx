import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Users, TrendingUp, Globe, Mail, Calendar, ArrowLeft } from 'lucide-react'

function AdminPanel() {
  const [stats, setStats] = useState({
    total_signups: 0,
    today_signups: 0,
    week_signups: 0,
    mena_percentage: 0,
    country_distribution: []
  })
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchSignups()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchSignups = async () => {
    try {
      const response = await fetch('/api/admin/signups')
      const data = await response.json()
      if (response.ok) {
        setSignups(data.signups)
      }
    } catch (error) {
      console.error('Failed to fetch signups:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">MinecraftME Admin Panel</h1>
            <p className="text-blue-200">Monitor your waitlist signups and analytics</p>
          </div>
          <a 
            href="/"
            className="flex items-center space-x-2 bg-slate-800/80 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 text-white hover:bg-slate-700/80 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Website</span>
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-orange-400 font-semibold text-2xl">{stats.total_signups}</p>
                  <p className="text-blue-200 text-sm">Total Signups</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-green-400 font-semibold text-2xl">+{stats.today_signups}</p>
                  <p className="text-blue-200 text-sm">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-blue-400 font-semibold text-2xl">+{stats.week_signups}</p>
                  <p className="text-blue-200 text-sm">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Globe className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-purple-400 font-semibold text-2xl">{stats.mena_percentage}%</p>
                  <p className="text-blue-200 text-sm">From MENA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Signups */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Recent Signups</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-blue-200 font-medium py-3 px-4">#</th>
                    <th className="text-left text-blue-200 font-medium py-3 px-4">Email</th>
                    <th className="text-left text-blue-200 font-medium py-3 px-4">Country</th>
                    <th className="text-left text-blue-200 font-medium py-3 px-4">Currency</th>
                    <th className="text-left text-blue-200 font-medium py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((signup, index) => (
                    <tr key={signup.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="text-white py-3 px-4">{signup.id}</td>
                      <td className="text-white py-3 px-4">{signup.email}</td>
                      <td className="text-orange-400 py-3 px-4">{signup.country || 'N/A'}</td>
                      <td className="text-blue-400 py-3 px-4">{signup.currency || 'USD'}</td>
                      <td className="text-blue-200 py-3 px-4">{formatDate(signup.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {signups.length === 0 && (
                <div className="text-center py-8 text-blue-200">
                  No signups yet. Share your website to get started!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Country Distribution */}
        {stats.country_distribution && stats.country_distribution.length > 0 && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-md mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Country Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.country_distribution.map((country, index) => (
                  <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <span className="text-white">{country.country}</span>
                    <span className="text-orange-400 font-semibold">{country.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default AdminPanel


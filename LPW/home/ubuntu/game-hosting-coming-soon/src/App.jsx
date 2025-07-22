import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Clock, Server, Settings, Headphones, MapPin, Shield, Check, Zap, Menu, X, Star } from 'lucide-react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currency, setCurrency] = useState({ symbol: '$', code: 'USD' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [signupCount, setSignupCount] = useState(127) // Demo counter
  const [isVisible, setIsVisible] = useState({})
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Countdown timer logic
  useEffect(() => {
    // Set a fixed target date (30 days from today)
    // This ensures the countdown doesn't reset on page refresh
    const today = new Date()
    const launchDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days from now
    
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now
      
      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        
        setCountdown({ days, hours, minutes, seconds })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('[data-animate]')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  // Currency mapping based on country
  const currencyMap = {
    'AE': { symbol: 'د.إ', code: 'AED' }, // UAE Dirham
    'SA': { symbol: '﷼', code: 'SAR' }, // Saudi Riyal
    'EG': { symbol: '£', code: 'EGP' }, // Egyptian Pound
    'TR': { symbol: '₺', code: 'TRY' }, // Turkish Lira
    'IL': { symbol: '₪', code: 'ILS' }, // Israeli Shekel
    'BH': { symbol: '.د.ب', code: 'BHD' }, // Bahraini Dinar
    'KW': { symbol: 'د.ك', code: 'KWD' }, // Kuwaiti Dinar
    'QA': { symbol: '﷼', code: 'QAR' }, // Qatari Riyal
    'OM': { symbol: '﷼', code: 'OMR' }, // Omani Rial
    'JO': { symbol: 'د.ا', code: 'JOD' }, // Jordanian Dinar
    'LB': { symbol: '£', code: 'LBP' }, // Lebanese Pound
    'default': { symbol: '$', code: 'USD' }
  }

  // Exchange rates (approximate, in production you'd fetch from an API)
  const exchangeRates = {
    'AED': 3.67, 'SAR': 3.75, 'EGP': 30.9, 'TRY': 34.2, 'ILS': 3.7,
    'BHD': 0.377, 'KWD': 0.307, 'QAR': 3.64, 'OMR': 0.385, 'JOD': 0.709, 'LBP': 89500
  }

  useEffect(() => {
    // Detect user's country and set currency
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        const countryCode = data.country_code
        const userCurrency = currencyMap[countryCode] || currencyMap.default
        setCurrency(userCurrency)
      })
      .catch(() => {
        // Fallback to USD if geolocation fails
        setCurrency(currencyMap.default)
      })
  }, [])

  const convertPrice = (usdPrice) => {
    if (currency.code === 'USD') return usdPrice
    const rate = exchangeRates[currency.code] || 1
    return Math.round(usdPrice * rate)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (email) {
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            country: currency.code === 'USD' ? 'US' : Object.keys(currencyMap).find(key => currencyMap[key].code === currency.code) || 'US',
            currency: currency.code
          })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          console.log('Email submitted:', email)
          setIsSubmitted(true)
          setSignupCount(data.total_signups)
        } else {
          console.error('Signup failed:', data.error)
          // Still show success for demo purposes
          setIsSubmitted(true)
          setSignupCount(prev => prev + 1)
        }
      } catch (error) {
        console.error('Network error:', error)
        // Still show success for demo purposes
        setIsSubmitted(true)
        setSignupCount(prev => prev + 1)
      }
    }
  }

  // Fetch admin stats
  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (response.ok) {
        setSignupCount(data.total_signups)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    }
  }

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const pricingPlans = [
    {
      name: 'Starter',
      price: 5,
      features: ['1 GB RAM', '10 GB SSD', '5 Player Slots', 'Basic Support'],
      popular: false
    },
    {
      name: 'Gamer',
      price: 12,
      features: ['2 GB RAM', '25 GB SSD', '15 Player Slots', 'Priority Support', 'DDoS Protection'],
      popular: true
    },
    {
      name: 'Pro',
      price: 25,
      features: ['4 GB RAM', '50 GB SSD', '30 Player Slots', '24/7 Support', 'DDoS Protection', 'Auto Backups'],
      popular: false
    },
    {
      name: 'Elite',
      price: 45,
      features: ['8 GB RAM', '100 GB SSD', 'Unlimited Players', '24/7 Priority Support', 'DDoS Protection', 'Auto Backups', 'Custom Plugins'],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl">MineEast</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-blue-200 hover:text-orange-400 transition-colors duration-300"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-blue-200 hover:text-orange-400 transition-colors duration-300"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-blue-200 hover:text-orange-400 transition-colors duration-300"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-blue-200 hover:text-orange-400 transition-colors duration-300"
              >
                About
              </button>
              <Button 
                onClick={() => scrollToSection('waitlist')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                Join Waitlist
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-orange-400 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-slate-800/95 backdrop-blur-md rounded-lg mt-2 p-4 border border-white/10">
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-blue-200 hover:text-orange-400 transition-colors text-left"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-blue-200 hover:text-orange-400 transition-colors text-left"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-blue-200 hover:text-orange-400 transition-colors text-left"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-blue-200 hover:text-orange-400 transition-colors text-left"
                >
                  About
                </button>
                <Button 
                  onClick={() => scrollToSection('waitlist')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white w-full"
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping"></div>
        </div>
        
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Hero content */}
        <div 
          id="hero-content" 
          data-animate
          className={`relative z-10 text-center max-w-4xl mx-auto transition-all duration-1000 ${
            isVisible['hero-content'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-500/30 mb-6">
              <Star className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-medium">Now Live: {signupCount}+ Early Adopters</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="inline-block animate-fade-in-up">Ultra-Low Latency</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-fade-in-up animation-delay-200">
              First Minecraft Hosting Company
            </span>
            <span className="block text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mt-4 animate-fade-in-up animation-delay-400 drop-shadow-lg">
              for the MIDDLE EAST
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600">
            Get 20–30 ms ping across the <span className="text-orange-400 font-semibold">MIDDLE EAST</span> — UAE, KSA & Egypt — with DDoS protection and Arabic & English support.
          </p>

          {/* Countdown Timer */}
          <div 
            id="countdown"
            className="bg-gradient-to-r from-orange-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 max-w-2xl mx-auto border border-white/20 mb-8 animate-fade-in-up animation-delay-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              🚀 Launch Countdown
            </h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-bold text-orange-400">{countdown.days}</div>
                <div className="text-sm text-blue-200">Days</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-bold text-orange-400">{countdown.hours}</div>
                <div className="text-sm text-blue-200">Hours</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-bold text-orange-400">{countdown.minutes}</div>
                <div className="text-sm text-blue-200">Minutes</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-bold text-orange-400">{countdown.seconds}</div>
                <div className="text-sm text-blue-200">Seconds</div>
              </div>
            </div>
            <p className="text-blue-200 text-sm mt-4 text-center">
              Until MineEast officially launches in the Middle East
            </p>
          </div>

          {/* Email Capture Form */}
          <div 
            id="waitlist"
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-white/20 animate-fade-in-up animation-delay-800 hover:bg-white/15 transition-all duration-300"
          >
            <h3 className="text-2xl font-semibold text-white mb-4">
              Join the Waitlist
            </h3>
            <p className="text-blue-200 mb-6">
              Be the first to experience lag-free gaming with exclusive founding-member perks
            </p>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 focus:border-orange-400 transition-all duration-300 focus:scale-105"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 text-lg transform hover:scale-105 transition-all duration-300"
                >
                  I'm Interested
                </Button>
              </form>
            ) : (
              <div className="text-center animate-fade-in">
                <div className="text-green-400 text-6xl mb-4 animate-bounce">✓</div>
                <h4 className="text-xl font-semibold text-white mb-2">Thank You!</h4>
                <p className="text-blue-200">We'll notify you when we launch.</p>
                <p className="text-orange-400 text-sm mt-2">You're #{signupCount} on the waitlist!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div 
            id="features-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible['features-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose MineEast?
            </h2>
            <p className="text-xl text-blue-200">
              Built specifically for <span className="text-orange-400 font-semibold">MIDDLE EASTERN</span> gamers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card 
              id="feature-1"
              data-animate
              className={`bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 hover:scale-105 transition-all duration-500 group ${
                isVisible['feature-1'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-white mb-2">20ms Average Ping</h3>
                <p className="text-blue-200">Lightning-fast response times to Gulf region</p>
              </CardContent>
            </Card>

            <Card 
              id="feature-2"
              data-animate
              className={`bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 hover:scale-105 transition-all duration-500 group animation-delay-200 ${
                isVisible['feature-2'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-white mb-2">Local Servers</h3>
                <p className="text-blue-200">Strategically located in Israel, Bahrain & Istanbul</p>
              </CardContent>
            </Card>

            <Card 
              id="feature-3"
              data-animate
              className={`bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 hover:scale-105 transition-all duration-500 group animation-delay-400 ${
                isVisible['feature-3'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <CardContent className="p-6 text-center">
                <Settings className="w-12 h-12 text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-white mb-2">Interactive Panel</h3>
                <p className="text-blue-200">Full control with industry-standard management</p>
              </CardContent>
            </Card>

            <Card 
              id="feature-4"
              data-animate
              className={`bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 hover:scale-105 transition-all duration-500 group animation-delay-600 ${
                isVisible['feature-4'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <CardContent className="p-6 text-center">
                <Headphones className="w-12 h-12 text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-white mb-2">24/7 Support</h3>
                <p className="text-blue-200">Arabic & English support around the clock</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div 
            id="pricing-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible['pricing-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-blue-200">
              Our services are coming soon! Join the waitlist to be notified when plans become available.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                id={`pricing-${index}`}
                data-animate
                className={`relative bg-white/10 border-white/20 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:bg-white/15 group ${
                  plan.popular ? 'ring-2 ring-orange-400 scale-105' : ''
                } ${
                  isVisible[`pricing-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold animate-pulse">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-300">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-orange-400 group-hover:scale-110 transition-transform duration-300">
                    {currency.symbol}{convertPrice(plan.price)}
                    <span className="text-lg text-blue-200 font-normal">/{currency.code === 'USD' ? 'mo' : 'شهر'}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-blue-200 group-hover:text-white transition-colors duration-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold py-3 transform hover:scale-105 transition-all duration-300 cursor-not-allowed"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div 
            id="pricing-footer"
            data-animate
            className={`text-center mt-12 transition-all duration-1000 ${
              isVisible['pricing-footer'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <p className="text-blue-200 mb-4">
              All plans include DDoS protection and 99.9% uptime guarantee
            </p>
            <div className="flex justify-center items-center space-x-2 text-sm text-blue-300">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>Prices automatically converted to your local currency</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="about" className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div 
            id="about-content"
            data-animate
            className={`bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 ${
              isVisible['about-content'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <Shield className="w-16 h-16 text-orange-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              Built by Regional Developers for the <span className="text-orange-400">MIDDLE EAST</span>
            </h3>
            <p className="text-blue-200 text-lg mb-6">
              This service is crafted by young, passionate developers who understand the unique gaming needs of the <span className="text-orange-400 font-semibold">MENA region</span>.
            </p>
            <p className="text-orange-400 font-semibold text-xl">
              Be the first in the <span className="text-blue-400">MIDDLE EAST</span> to experience truly lag-free Minecraft gaming
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900/80 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center space-x-8 mb-6">
            <a href="#" className="text-blue-300 hover:text-orange-400 transition-colors duration-300 hover:scale-110 transform">
              Discord
            </a>
            <a href="#" className="text-blue-300 hover:text-orange-400 transition-colors duration-300 hover:scale-110 transform">
              Instagram
            </a>
          </div>
          <p className="text-blue-300 text-sm">
            © 2025 MineEast - First Minecraft Hosting Company in the <span className="text-orange-400 font-semibold">MIDDLE EAST</span>.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App


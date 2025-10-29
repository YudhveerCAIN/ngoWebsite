import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../ui/Button'
import { Image } from '../ui'

// Import logo
import logo from '../../assets/images/logo/cropped-urjja-prathisthan-logo-150x150.png'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Programs', href: '/programs' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Get Involved', href: '/get-involved' },
    { name: 'Contact', href: '/contact' },
  ]
  
  const isActive = (path) => location.pathname === path
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Image 
                src={logo} 
                alt="Urjja Pratishthan Prakashalay Logo" 
                className="w-16 h-16 object-contain hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1" aria-label="Primary">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-primary-600 bg-primary-50 shadow-sm'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link to="/get-involved">
              <Button variant="outline" size="sm" className="font-medium">
                Volunteer
              </Button>
            </Link>
            <Link to="/donate">
              <Button size="sm" className="font-medium bg-primary-600 hover:bg-primary-700">
                Donate Now
              </Button>
            </Link>
          </div>      
    
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 p-2 rounded-md transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 bg-white shadow-lg">
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 text-base font-semibold rounded-lg mx-2 transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50 shadow-sm'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-3 pt-4 mt-4 border-t border-gray-200 mx-2">
                <Link to="/get-involved" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full font-medium">
                    Volunteer
                  </Button>
                </Link>
                <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full font-medium bg-primary-600 hover:bg-primary-700">
                    Donate Now
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
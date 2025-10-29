import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = {
    organization: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Programs', href: '/programs' },
      { name: 'Gallery', href: '/gallery' },
      { name: 'News & Events', href: '/news-events' },
    ],
    getInvolved: [
      { name: 'Volunteer', href: '/get-involved' },
      { name: 'Donate', href: '/donate' },
      { name: 'Partner with Us', href: '/contact' },
      { name: 'Spread the Word', href: '/contact' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/legal' },
      { name: 'Terms of Service', href: '/legal' },
      { name: 'FAQ', href: '/contact' },
    ]
  }
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="ml-2 text-xl font-bold">
                Urjja Pratishthan
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Enabling vision through education and opportunity. 
              Empowering underserved communities through inclusive programs and mentorship.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z"/>
                </svg>
              </a>
            </div>
          </div> 
         
          {/* Organization Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Organization
            </h3>
            <ul className="space-y-2">
              {footerLinks.organization.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Get Involved Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Get Involved
            </h3>
            <ul className="space-y-2">
              {footerLinks.getInvolved.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Urjja Pratishthan Prakashalay. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                Made with ❤️ for a better tomorrow
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
import { useState, useEffect, useRef } from 'react'

const ImpactCounter = ({ 
  end, 
  duration = 2000, 
  label, 
  prefix = '', 
  suffix = '',
  className = '',
  description = '',
  icon = null,
  color = 'primary',
  size = 'md',
  showGrowth = false,
  growthPercentage = 0,
  delay = 0
}) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const counterRef = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold: 0.1 }
    )
    
    if (counterRef.current) {
      observer.observe(counterRef.current)
    }
    
    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current)
      }
    }
  }, [hasAnimated, delay])
  
  useEffect(() => {
    if (!isVisible || hasAnimated) return
    
    let startTime = null
    const startCount = 0
    
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Enhanced easing function for more natural animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(easeOutCubic * (end - startCount) + startCount)
      
      setCount(currentCount)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
        setHasAnimated(true)
      }
    }
    
    requestAnimationFrame(animate)
  }, [isVisible, end, duration, hasAnimated])
  
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }
  
  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    green: 'text-blue-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  }
  
  const sizeClasses = {
    sm: 'text-2xl md:text-3xl',
    md: 'text-4xl md:text-5xl',
    lg: 'text-5xl md:text-6xl'
  }
  
  const iconColorClasses = {
    primary: 'text-primary-500 bg-primary-100',
    secondary: 'text-secondary-500 bg-secondary-100',
    green: 'text-blue-500 bg-blue-100',
    blue: 'text-blue-500 bg-blue-100',
    purple: 'text-purple-500 bg-purple-100',
    orange: 'text-orange-500 bg-orange-100'
  }
  
  return (
    <div 
      ref={counterRef} 
      className={`text-center transition-all duration-500 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      } ${className}`}
    >
      {/* Icon */}
      {icon && (
        <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${iconColorClasses[color]}`}>
          {icon}
        </div>
      )}
      
      {/* Counter */}
      <div className={`font-bold mb-2 ${colorClasses[color]} ${sizeClasses[size]}`}>
        <span className="tabular-nums">
          {prefix}{formatNumber(count)}{suffix}
        </span>
        
        {/* Growth indicator */}
        {showGrowth && growthPercentage > 0 && isVisible && (
          <div className="inline-flex items-center ml-2 text-sm font-medium text-blue-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
            +{growthPercentage}%
          </div>
        )}
      </div>
      
      {/* Label */}
      <div className="text-lg font-medium text-gray-900 mb-1">
        {label}
      </div>
      
      {/* Description */}
      {description && (
        <div className="text-sm text-gray-500">
          {description}
        </div>
      )}
    </div>
  )
}

export default ImpactCounter
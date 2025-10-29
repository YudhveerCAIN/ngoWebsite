import { useState, useEffect, useRef } from 'react'

const ImpactChart = ({ 
  data = [], 
  type = 'bar', // 'bar', 'line', 'progress'
  title = '',
  className = '',
  color = 'primary',
  height = 200,
  showValues = true,
  animated = true
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const chartRef = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    
    if (chartRef.current) {
      observer.observe(chartRef.current)
    }
    
    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current)
      }
    }
  }, [isVisible])
  
  useEffect(() => {
    if (!isVisible || !animated) {
      setAnimationProgress(1)
      return
    }
    
    let startTime = null
    const duration = 1500
    
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      setAnimationProgress(easeOutCubic)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [isVisible, animated])
  
  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }
  
  const lightColorClasses = {
    primary: 'bg-primary-100',
    secondary: 'bg-secondary-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100'
  }
  
  const maxValue = Math.max(...data.map(item => item.value))
  
  const renderBarChart = () => (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100
        const animatedWidth = percentage * animationProgress
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              {showValues && (
                <span className="text-sm text-gray-500">
                  {Math.round(item.value * animationProgress).toLocaleString()}
                </span>
              )}
            </div>
            <div className={`w-full h-3 rounded-full ${lightColorClasses[color]}`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ${colorClasses[color]}`}
                style={{ width: `${animatedWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
  
  const renderProgressChart = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((item, index) => {
        const percentage = item.percentage || (item.value / item.target) * 100
        const animatedPercentage = Math.min(percentage * animationProgress, 100)
        
        return (
          <div key={index} className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {/* Background circle */}
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className={`${lightColorClasses[color]} opacity-20`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - animatedPercentage / 100)}`}
                  className={`${colorClasses[color].replace('bg-', 'text-')} transition-all duration-1000`}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {Math.round(animatedPercentage)}%
                </span>
              </div>
            </div>
            
            <h4 className="font-medium text-gray-900 mb-1">{item.label}</h4>
            {showValues && (
              <p className="text-sm text-gray-500">
                {Math.round(item.value * animationProgress).toLocaleString()}
                {item.target && ` / ${item.target.toLocaleString()}`}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
  
  const renderLineChart = () => (
    <div className="relative" style={{ height: `${height}px` }}>
      <svg width="100%" height="100%" className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Data line */}
        {data.length > 1 && (
          <polyline
            fill="none"
            stroke={`rgb(var(--color-${color}-500))`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((item.value / maxValue) * 100 * animationProgress)
              return `${x},${y}`
            }).join(' ')}
          />
        )}
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((item.value / maxValue) * 100 * animationProgress)
          
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill={`rgb(var(--color-${color}-500))`}
              className="transition-all duration-300"
            />
          )
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  )
  
  return (
    <div ref={chartRef} className={`${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      
      {type === 'bar' && renderBarChart()}
      {type === 'progress' && renderProgressChart()}
      {type === 'line' && renderLineChart()}
    </div>
  )
}

export default ImpactChart
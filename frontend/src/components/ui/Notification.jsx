import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

const Notification = () => {
  const { notification, hideNotification } = useApp()
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  useEffect(() => {
    if (notification.visible && notification.message) {
      setIsVisible(true)
      setIsLeaving(false)
    } else {
      setIsLeaving(true)
      setTimeout(() => {
        setIsVisible(false)
        setIsLeaving(false)
      }, 300) // Match animation duration
    }
  }, [notification.visible, notification.message])
  
  const handleClose = () => {
    hideNotification()
  }
  
  if (!isVisible && !notification.visible) {
    return null
  }
  
  const getNotificationStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300 transform"
    
    const typeStyles = {
      success: "border-blue-500 bg-blue-50",
      error: "border-red-500 bg-red-50",
      warning: "border-yellow-500 bg-yellow-50",
      info: "border-blue-500 bg-blue-50"
    }
    
    const animationStyles = isLeaving 
      ? "translate-x-full opacity-0" 
      : "translate-x-0 opacity-100"
    
    return `${baseStyles} ${typeStyles[notification.type] || typeStyles.info} ${animationStyles}`
  }
  
  const getIcon = () => {
    const iconStyles = "w-5 h-5 mr-3 flex-shrink-0"
    
    switch (notification.type) {
      case 'success':
        return (
          <svg className={`${iconStyles} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className={`${iconStyles} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'warning':
        return (
          <svg className={`${iconStyles} text-yellow-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'info':
      default:
        return (
          <svg className={`${iconStyles} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }
  
  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-blue-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
      default:
        return 'text-blue-800'
    }
  }
  
  return (
    <div className={getNotificationStyles()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className={`ml-3 flex-shrink-0 ${getTextColor()} hover:opacity-75 transition-opacity`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Notification
import { Card } from '../ui'

const StoryCard = ({ story, className = '' }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Story Image */}
      {story.image && (
        <div className="aspect-w-16 aspect-h-9">
          <img 
            src={story.image} 
            alt={story.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}
      
      <Card.Content className="p-6">
        {/* Story Category */}
        {story.category && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-3">
            {story.category}
          </span>
        )}
        
        {/* Story Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {story.title}
        </h3>
        
        {/* Story Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {story.excerpt || story.content}
        </p>
        
        {/* Story Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          {story.location && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{story.location}</span>
            </div>
          )}
          
          {story.date && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(story.date)}</span>
            </div>
          )}
        </div>
        
        {/* Beneficiary Info */}
        {story.beneficiary && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">{story.beneficiary.name}</p>
                {story.beneficiary.age && (
                  <p className="text-sm text-gray-500">Age {story.beneficiary.age}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Impact Metrics */}
        {story.impact && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Impact</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(story.impact).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="font-semibold text-primary-600">{value}</div>
                  <div className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

export default StoryCard
import { useState, useEffect } from 'react'
import { LoadingSpinner, Button } from '../components/ui'

// Import images from assets
import img1 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.48_747b1c18-1024x485.jpg'
import img2 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.51_87156a55.jpg'
import img3 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.52_858cc299.jpg'
import img4 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.53_66b5bf2f.jpg'
import img5 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.54_7743e0bf.jpg'

export default function Gallery() {
	const [selectedImage, setSelectedImage] = useState(null)
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [loading, setLoading] = useState(false)

	// Gallery categories and images
	const galleryData = {
		categories: [
			{ id: 'all', name: 'All Photos', count: 25 },
			{ id: 'activities', name: 'Various Activities', count: 12 },
			{ id: 'moments', name: 'Happy Moments', count: 8 },
			{ id: 'events', name: 'Special Events', count: 5 }
		],
		images: [
			{
				id: 1,
				src: img1,
				title: 'Students Learning Together',
				description: 'Our visually impaired students engaged in collaborative learning activities',
				category: 'activities',
				date: '2024-04-02'
			},
			{
				id: 2,
				src: img2,
				title: 'Community Gathering',
				description: 'A heartwarming moment during our community gathering event',
				category: 'moments',
				date: '2024-04-02'
			},
			{
				id: 3,
				src: img3,
				title: 'Skill Development Session',
				description: 'Students participating in skill development and training programs',
				category: 'activities',
				date: '2024-04-02'
			},
			{
				id: 4,
				src: img4,
				title: 'Celebration Time',
				description: 'Joyful celebrations and achievements at Urjja Pratishthan Prakashalay',
				category: 'moments',
				date: '2024-04-02'
			},
			{
				id: 5,
				src: img5,
				title: 'Educational Activities',
				description: 'Specialized educational programs designed for visually impaired students',
				category: 'activities',
				date: '2024-04-02'
			},
			// Additional placeholder images
			{
				id: 6,
				src: img1,
				title: 'Daily Life at Prakashalay',
				description: 'Glimpses of daily life and activities at our center',
				category: 'moments',
				date: '2024-03-15'
			},
			{
				id: 7,
				src: img2,
				title: 'Workshop Session',
				description: 'Students engaged in hands-on workshop activities',
				category: 'activities',
				date: '2024-03-10'
			},
			{
				id: 8,
				src: img3,
				title: 'Annual Function',
				description: 'Highlights from our annual function and cultural program',
				category: 'events',
				date: '2024-02-20'
			},
			{
				id: 9,
				src: img4,
				title: 'Volunteer Interaction',
				description: 'Volunteers spending quality time with our students',
				category: 'moments',
				date: '2024-02-15'
			},
			{
				id: 10,
				src: img5,
				title: 'Independence Day Celebration',
				description: 'Patriotic celebrations and cultural performances',
				category: 'events',
				date: '2024-08-15'
			}
		]
	}

	// Filter images based on selected category
	const filteredImages = selectedCategory === 'all' 
		? galleryData.images 
		: galleryData.images.filter(img => img.category === selectedCategory)

	const openLightbox = (image) => {
		setSelectedImage(image)
	}

	const closeLightbox = () => {
		setSelectedImage(null)
	}

	const navigateImage = (direction) => {
		const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
		let newIndex
		
		if (direction === 'next') {
			newIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1
		} else {
			newIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1
		}
		
		setSelectedImage(filteredImages[newIndex])
	}

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyPress = (e) => {
			if (!selectedImage) return
			
			if (e.key === 'Escape') {
				closeLightbox()
			} else if (e.key === 'ArrowRight') {
				navigateImage('next')
			} else if (e.key === 'ArrowLeft') {
				navigateImage('prev')
			}
		}

		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [selectedImage, filteredImages])

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<LoadingSpinner size="lg" />
					<p className="mt-4 text-gray-600">Loading gallery...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="py-16 bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Photo Gallery
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
						Some Moments of Prakashalay - Capturing the essence of our community, various activities, and happy moments shared together
					</p>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Explore the vibrant life at Urjja Pratishthan Prakashalay through these cherished photographs
					</p>
				</div>

				{/* Category Filter */}
				<div className="flex flex-wrap justify-center gap-4 mb-12">
					{galleryData.categories.map((category) => (
						<button
							key={category.id}
							onClick={() => setSelectedCategory(category.id)}
							className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
								selectedCategory === category.id
									? 'bg-primary-600 text-white shadow-lg'
									: 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 shadow-md'
							}`}
						>
							{category.name}
							<span className="ml-2 text-sm opacity-75">({category.count})</span>
						</button>
					))}
				</div>

				{/* Gallery Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
					{filteredImages.map((image) => (
						<div 
							key={image.id} 
							className="relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 rounded-lg"
							onClick={() => openLightbox(image)}
						>
							<div className="aspect-square">
								<img
									src={image.src}
									alt={image.title}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									loading="lazy"
								/>
							</div>
						</div>
					))}
				</div>

				{/* Load More Button */}
				<div className="text-center">
					<Button 
						variant="outline" 
						size="lg"
						onClick={() => {
							// Placeholder for load more functionality
							console.log('Load more images')
						}}
					>
						Load More Photos
					</Button>
				</div>

				{/* Lightbox Modal */}
				{selectedImage && (
					<div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
						<div className="relative max-w-4xl max-h-full">
							{/* Close Button */}
							<button
								onClick={closeLightbox}
								className="absolute top-4 right-4 z-10 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>

							{/* Navigation Buttons */}
							<button
								onClick={() => navigateImage('prev')}
								className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>

							<button
								onClick={() => navigateImage('next')}
								className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>

							{/* Image */}
							<img
								src={selectedImage.src}
								alt={selectedImage.title}
								className="max-w-full max-h-[80vh] object-contain mx-auto"
							/>

							{/* Image Counter */}
							<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
								{filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
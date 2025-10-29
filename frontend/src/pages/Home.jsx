import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, LoadingSpinner, Image } from '../components/ui'

// Import images
import heroImage1 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.48_747b1c18-1024x485.jpg'
import heroImage2 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.51_87156a55.jpg'
import heroImage3 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.52_858cc299.jpg'
import heroImage4 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.53_66b5bf2f.jpg'
import heroImage5 from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.54_7743e0bf.jpg'
import programImage1 from '../assets/images/programs/IMG-20240624-WA0065-1024x512.jpg'
import programImage2 from '../assets/images/programs/IMG-20240624-WA0091-1-768x1024.jpg'

export default function Home() {
	const [currentSlide, setCurrentSlide] = useState(0)

	// Hero images for carousel
	const heroImages = [
		{
			src: heroImage1,
			alt: "Students at Urjja Pratishthan Prakashalay",
			title: "Enabling Vision Through Education",
			subtitle: "Empowering visually challenged individuals to lead fulfilling lives"
		},
		{
			src: heroImage2,
			alt: "Educational support programs",
			title: "Comprehensive Educational Support",
			subtitle: "Providing holistic support for visually impaired students"
		},
		{
			src: heroImage3,
			alt: "Community engagement activities",
			title: "Building Inclusive Communities",
			subtitle: "Fostering acceptance and inclusion in society"
		},
		{
			src: heroImage4,
			alt: "Skill development programs",
			title: "Skill Development & Training",
			subtitle: "Empowering individuals with practical skills for independence"
		},
		{
			src: heroImage5,
			alt: "Community outreach programs",
			title: "Community Outreach",
			subtitle: "Raising awareness and creating supportive environments"
		}
	]

	useEffect(() => {
		let isMounted = true
		async function fetchImpact() {
			try {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/impact`)
				if (!res.ok) throw new Error('Failed to load impact')
				const data = await res.json()
				if (isMounted) setImpact(data)
			} catch (err) {
				if (isMounted) setError(err.message)
			} finally {
				if (isMounted) setLoading(false)
			}
		}
		fetchImpact()
		return () => {
			isMounted = false
		}
	}, [])

	// Auto-advance carousel
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % heroImages.length)
		}, 5000) // Change slide every 5 seconds

		return () => clearInterval(timer)
	}, [heroImages.length])

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % heroImages.length)
	}

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
	}

	const goToSlide = (index) => {
		setCurrentSlide(index)
	}

	return (
		<div>
			{/* Hero Carousel Section */}
			<section className="relative h-screen overflow-hidden">
				{/* Carousel Images */}
				<div className="absolute inset-0">
					{heroImages.map((image, index) => (
						<div
							key={index}
							className={`absolute inset-0 transition-opacity duration-1000 ${
								index === currentSlide ? 'opacity-100' : 'opacity-0'
							}`}
						>
							<Image 
								src={image.src} 
								alt={image.alt}
								className="w-full h-full object-cover"
							/>
							{/* Dark overlay for text readability */}
							<div className="absolute inset-0 bg-black/40"></div>
						</div>
					))}
				</div>

				{/* Carousel Content */}
				<div className="relative z-10 h-full flex items-center justify-center">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
						<div className="animate-fade-in-up">
							<h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
								{heroImages[currentSlide].title}
							</h1>
							<p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
								{heroImages[currentSlide].subtitle}
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link to="/get-involved">
									<Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100">
										Become a Volunteer
									</Button>
								</Link>
								<Link to="/donate">
									<Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
										Donate Now
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Carousel Navigation */}
				<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
					<div className="flex space-x-2">
						{heroImages.map((_, index) => (
							<button
								key={index}
								onClick={() => goToSlide(index)}
								className={`w-3 h-3 rounded-full transition-all duration-300 ${
									index === currentSlide 
										? 'bg-white scale-125' 
										: 'bg-white/50 hover:bg-white/75'
								}`}
								aria-label={`Go to slide ${index + 1}`}
							/>
						))}
					</div>
				</div>

				{/* Carousel Arrows */}
				<button
					onClick={prevSlide}
					className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300"
					aria-label="Previous slide"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<button
					onClick={nextSlide}
					className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300"
					aria-label="Next slide"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</section>

			{/* What We Do Section */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="heading-secondary mb-4">
							What We Do
						</h2>
						<p className="text-lg text-gray-600 max-w-3xl mx-auto">
							We are dedicated to fostering a nurturing environment specifically designed for visually impaired students, providing comprehensive support for their overall well-being and empowerment.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<Card className="text-center p-8 card-hover">
							<div className="relative mb-6">
								<Image 
									src={programImage1} 
									alt="Educational Support Program" 
									className="w-full h-48 object-cover rounded-lg"
								/>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-3">Educational Support</h3>
							<p className="text-gray-600 leading-relaxed">
								At our educational support center, we provide not only educational opportunities but also essential support systems including shelter, daily meals, and academic assistance for visually impaired students.
							</p>
						</Card>
						<Card className="text-center p-8 card-hover">
							<div className="relative mb-6">
								<Image 
									src={programImage2} 
									alt="Skill Development Program" 
									className="w-full h-48 object-cover rounded-lg"
								/>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-3">Skill Development</h3>
							<p className="text-gray-600 leading-relaxed">
								We offer comprehensive skill development opportunities to empower visually impaired individuals to achieve financial independence and lead fulfilling lives.
							</p>
						</Card>
						<Card className="text-center p-8 card-hover">
							<div className="relative mb-6">
								<Image 
									src={heroImage2} 
									alt="Holistic Support Program" 
									className="w-full h-48 object-cover rounded-lg"
								/>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-3">Holistic Support</h3>
							<p className="text-gray-600 leading-relaxed">
								Our holistic approach addresses physical, emotional, and educational needs, providing healthcare assistance, nutritious meals, and opportunities for social integration.
							</p>
						</Card>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="heading-secondary mb-6">
								Our Mission
							</h2>
							<p className="text-lg text-gray-700 leading-relaxed mb-6">
								At Urjja Pratishthan Prakashalay, our mission is to illuminate the lives of visually impaired individuals by providing them with holistic support, empowering them to lead independent and fulfilling lives, and fostering their integration into society.
							</p>
							<p className="text-lg text-gray-700 leading-relaxed mb-8">
								Established in 2014 by Mr. Pankaj Kulkarni, we are committed to addressing the diverse needs of visually impaired individuals and creating opportunities for their personal and professional growth.
							</p>
							<Link to="/about">
								<Button size="lg">
									Learn More About Us
								</Button>
							</Link>
						</div>
						<div className="relative">
							<Image 
								src={heroImage3} 
								alt="Students and staff at Urjja Pratishthan Prakashalay" 
								className="rounded-lg shadow-lg w-full h-96 object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
						</div>
					</div>
				</div>
			</section>




		</div>
	)
}

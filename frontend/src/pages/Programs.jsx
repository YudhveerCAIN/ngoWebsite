import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, LoadingSpinner, Button, Image } from '../components/ui'

// Import images from whatWeDo folder
import educationalSupport1 from '../assets/images/whatWeDo/IMG-20240624-WA0103-1024x512.jpg'
import educationalSupport2 from '../assets/images/whatWeDo/WhatsApp-Image-2024-04-02-at-17.37.11_5d03a4e7-1-1024x461.jpg'
import skillDevelopment1 from '../assets/images/whatWeDo/IMG-20240624-WA0064-1024x512.jpg'
import skillDevelopment2 from '../assets/images/whatWeDo/IMG-20240624-WA0073-512x1024.jpg'
import communityOutreach1 from '../assets/images/whatWeDo/IMG-20240624-WA0061-300x225.jpg'
import communityOutreach2 from '../assets/images/whatWeDo/IMG-20240624-WA0105.jpg'
import healthcareSupport1 from '../assets/images/whatWeDo/IMG-20240617-WA0012-765x1024.jpg'
import healthcareSupport2 from '../assets/images/whatWeDo/IMG-20240624-WA0115-1024x473.jpg'
import activities1 from '../assets/images/whatWeDo/IMG-20240624-WA0104.jpg'

export default function Programs() {
	const [loading, setLoading] = useState(false)
	const [selectedProgram, setSelectedProgram] = useState('educational')

	// Our main programs based on the authentic template content
	const programs = [
		{
			id: 'educational',
			title: 'Educational Support',
			description: 'At our educational support center, we are dedicated to fostering a nurturing environment specifically designed for visually impaired students.',
			fullDescription: 'We recognize the importance of providing not only educational opportunities but also essential support systems that contribute to their overall well-being. Our center offers more than just a place to learn; it is a safe haven where students receive comprehensive care, including residential facilities, nutritious meals, academic support, and emotional guidance.',
			images: [educationalSupport1, educationalSupport2],
			features: [
				'Residential facilities and daily meals',
				'Academic support and tutoring',
				'Specialized learning materials',
				'Individual attention and care',
				'Safe and nurturing environment'
			],
			color: 'blue'
		},
		{
			id: 'skill',
			title: 'Skill Development',
			description: 'Comprehensive skill development programs to empower visually impaired individuals with practical abilities.',
			fullDescription: 'Our skill development programs focus on building practical abilities that enable visually impaired individuals to achieve financial independence and lead fulfilling lives. We provide training in various vocational skills, career guidance, and placement support.',
			images: [skillDevelopment1, skillDevelopment2],
			features: [
				'Vocational training programs',
				'Career guidance and counseling',
				'Job placement assistance',
				'Entrepreneurship support',
				'Life skills development'
			],
			color: 'green'
		},
		{
			id: 'outreach',
			title: 'Community Outreach',
			description: 'Community outreach is integral to our mission of raising awareness about visual impairment and fostering inclusion.',
			fullDescription: 'Through various initiatives, we strive to educate and engage the community in understanding the challenges faced by visually impaired individuals and how everyone can contribute to creating a more supportive environment. Our outreach programs include eye checkup camps, tribal community support, and awareness campaigns.',
			images: [communityOutreach1, communityOutreach2],
			features: [
				'Eye checkup camps',
				'Tribal community support',
				'Awareness campaigns',
				'Community education programs',
				'Inclusion advocacy'
			],
			color: 'purple'
		},
		{
			id: 'healthcare',
			title: 'Healthcare Assistance',
			description: 'Comprehensive healthcare support for visually impaired individuals and their families.',
			fullDescription: 'We provide essential healthcare assistance including regular medical checkups, health consultations, and support for medical treatments. Our healthcare programs ensure that visually impaired individuals receive the medical attention they need.',
			images: [healthcareSupport1, healthcareSupport2],
			features: [
				'Regular health checkups',
				'Medical consultations',
				'Health care assistance',
				'Wellness programs',
				'Medical support coordination'
			],
			color: 'red'
		}
	]

	// Our comprehensive services
	const services = [
		'Residential facilities and daily meals',
		'Academic support and skill development',
		'Health care assistance',
		'Career guidance and placement support',
		'Assistance with marriage and family life for visually impaired individuals'
	]

	const selectedProgramData = programs.find(p => p.id === selectedProgram)

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<LoadingSpinner size="lg" />
					<p className="mt-4 text-gray-600">Loading programs...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="py-16 bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header Section */}
				<div className="text-center mb-16">
					<h1 className="heading-primary mb-6">
						What We Do
					</h1>
					<p className="text-xl text-gray-600 max-w-4xl mx-auto">
						At Urjja Pratishthan Prakashalay, we are dedicated to fostering a nurturing environment specifically designed for visually impaired students. We provide comprehensive support that addresses their physical, emotional, and educational needs.
					</p>
				</div>

				{/* Program Navigation */}
				<div className="mb-12">
					<div className="flex flex-wrap justify-center gap-4">
						{programs.map((program) => (
							<button
								key={program.id}
								onClick={() => setSelectedProgram(program.id)}
								className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
									selectedProgram === program.id
										? 'border-primary-500 bg-primary-50 text-primary-700'
										: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
								}`}
							>
								<span className="font-medium">{program.title}</span>
							</button>
						))}
					</div>
				</div>

				{/* Selected Program Details */}
				{selectedProgramData && (
					<div className="mb-16">
						<Card className="overflow-hidden">
							<div className={`p-8 bg-gradient-to-r ${
								selectedProgramData.color === 'blue' ? 'from-blue-50 to-blue-100' :
								selectedProgramData.color === 'green' ? 'from-green-50 to-green-100' :
								selectedProgramData.color === 'purple' ? 'from-purple-50 to-purple-100' :
								selectedProgramData.color === 'red' ? 'from-red-50 to-red-100' :
								'from-primary-50 to-primary-100'
							}`}>
								<div className="text-center mb-8">
									<h2 className="heading-secondary mb-4">{selectedProgramData.title}</h2>
									<p className="text-lg text-gray-700 max-w-3xl mx-auto">
										{selectedProgramData.description}
									</p>
								</div>
							</div>

							<div className="p-8">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-6">Program Details</h3>
										<p className="text-gray-700 leading-relaxed mb-6">
											{selectedProgramData.fullDescription}
										</p>
										
										<h4 className="text-lg font-semibold text-gray-900 mb-4">Key Features:</h4>
										<ul className="space-y-3">
											{selectedProgramData.features.map((feature, index) => (
												<li key={index} className="flex items-start">
													<span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
													<span className="text-gray-700">{feature}</span>
												</li>
											))}
										</ul>
									</div>

									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-6">Program Gallery</h3>
										<div className="grid grid-cols-1 gap-6">
											{selectedProgramData.images.map((image, index) => (
												<div key={index} className="relative">
													<Image 
														src={image} 
														alt={`${selectedProgramData.title} - Image ${index + 1}`}
														className="w-full h-64 object-cover rounded-lg shadow-md"
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</Card>
					</div>
				)}

				{/* Our Comprehensive Services */}
				<div className="mb-16">
					<Card className="p-8 lg:p-12">
						<h2 className="heading-secondary text-center mb-8">Our Comprehensive Services</h2>
						<p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
							We provide holistic support to visually impaired individuals, addressing all aspects of their development and well-being.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{services.map((service, index) => (
								<div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
									<div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
										<span className="text-primary-600 font-bold text-sm">{index + 1}</span>
									</div>
									<p className="text-gray-700">{service}</p>
								</div>
							))}
						</div>
					</Card>
				</div>

				{/* Activities Gallery */}
				<div className="mb-16">
					<h2 className="heading-secondary text-center mb-8">Our Activities</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="relative">
							<Image 
								src={activities1} 
								alt="Student activities and programs"
								className="w-full h-64 object-cover rounded-lg shadow-md"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg"></div>
							<div className="absolute bottom-4 left-4 text-white">
								<h3 className="text-lg font-semibold">Student Activities</h3>
							</div>
						</div>
						<div className="relative">
							<Image 
								src={skillDevelopment1} 
								alt="Educational support programs"
								className="w-full h-64 object-cover rounded-lg shadow-md"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg"></div>
							<div className="absolute bottom-4 left-4 text-white">
								<h3 className="text-lg font-semibold">Educational Support</h3>
							</div>
						</div>
						<div className="relative">
							<Image 
								src={communityOutreach2} 
								alt="Community engagement programs"
								className="w-full h-64 object-cover rounded-lg shadow-md"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg"></div>
							<div className="absolute bottom-4 left-4 text-white">
								<h3 className="text-lg font-semibold">Community Programs</h3>
							</div>
						</div>
					</div>
				</div>

				{/* Call to Action */}
				<div className="text-center">
					<Card className="p-12 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Support Our Mission
						</h2>
						<p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
							Your support enables us to provide essential resources, education, and opportunities to visually challenged individuals. Every donation, no matter how small, makes a difference in someone's life.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/get-involved">
								<Button size="lg" className="w-full sm:w-auto">
									Become a Volunteer
								</Button>
							</Link>
							<Link to="/donate">
								<Button variant="outline" size="lg" className="w-full sm:w-auto">
									Donate Now
								</Button>
							</Link>
							<Link to="/contact">
								<Button variant="outline" size="lg" className="w-full sm:w-auto">
									Contact Us
								</Button>
							</Link>
						</div>
					</Card>
				</div>
			</div>
		</div>
	)
}

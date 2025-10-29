import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, LoadingSpinner, Button, Image } from '../components/ui'

// Import images
import aboutImage from '../assets/images/hero/WhatsApp-Image-2024-04-02-at-17.32.53_66b5bf2f.jpg'

export default function About() {
	const [aboutData, setAboutData] = useState({
		story: null,
		visionMission: null
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		fetchAboutData()
	}, [])

	const fetchAboutData = async () => {
		try {
			setLoading(true)
			setError('')

			const [storyResponse, visionMissionResponse] = await Promise.all([
				fetch(`${import.meta.env.VITE_API_URL}/about/story`),
				fetch(`${import.meta.env.VITE_API_URL}/about/vision-mission`)
			])

			if (storyResponse.ok && visionMissionResponse.ok) {
				const [story, visionMission] = await Promise.all([
					storyResponse.json(),
					visionMissionResponse.json()
				])

				setAboutData({ story, visionMission })
			} else {
				throw new Error('Failed to fetch about data')
			}
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	// Team members data
	const teamMembers = [
		{
			id: 1,
			name: 'Mr. Pankaj Kulkarni',
			role: 'Founder & Director',
			bio: 'Driven by a desire to make a difference, Mr. Kulkarni established Urjja Pratishthan Prakashalay in 2014 to create a supportive environment for visually impaired individuals in Bhosari, Pune.',
			image: '/images/team/founder.jpg',
			qualifications: 'Dedicated Social Worker & Advocate for Visually Impaired'
		},
		{
			id: 2,
			name: 'Educational Team',
			role: 'Academic Support Staff',
			bio: 'Our dedicated educational team provides specialized academic support and skill development programs tailored for visually impaired students.',
			image: '/images/team/education-team.jpg',
			qualifications: 'Specialized in Visual Impairment Education'
		},
		{
			id: 3,
			name: 'Care Support Team',
			role: 'Residential & Healthcare Staff',
			bio: 'Our care support team ensures that all residents receive proper healthcare, nutritious meals, and a safe living environment.',
			image: '/images/team/care-team.jpg',
			qualifications: 'Healthcare & Residential Care Specialists'
		},
		{
			id: 4,
			name: 'Volunteer Network',
			role: 'Community Volunteers',
			bio: 'Our dedicated volunteers contribute their time and skills to support various programs and activities at the center.',
			image: '/images/team/volunteers.jpg',
			qualifications: 'Diverse Backgrounds United by Common Purpose'
		}
	]

	// Key statistics
	const statistics = [
		{ label: 'Years of Service', value: '11+', icon: '🏆' },
		{ label: 'Students Supported', value: '1,250+', icon: '🎓' },
		{ label: 'Programs Conducted', value: '48+', icon: '📚' },
		{ label: 'Volunteers Active', value: '85+', icon: '🤝' },
		{ label: 'Communities Reached', value: '25+', icon: '🌍' },
		{ label: 'Success Stories', value: '500+', icon: '⭐' }
	]

	// Core values
	const coreValues = [
		{
			title: 'Holistic Support',
			description: 'We provide comprehensive support addressing physical, emotional, and educational needs including shelter, meals, healthcare, and academic assistance.',
			icon: '🏠'
		},
		{
			title: 'Empowerment',
			description: 'Our goal is to empower visually impaired individuals to become self-reliant and achieve financial independence through skill development.',
			icon: '💪'
		},
		{
			title: 'Integration',
			description: 'We foster social integration by helping visually impaired individuals become active and valued members of society.',
			icon: '🤝'
		},
		{
			title: 'Quality Education',
			description: 'We provide specialized educational opportunities designed specifically for visually impaired students to excel academically.',
			icon: '📚'
		},
		{
			title: 'Dignity & Respect',
			description: 'We ensure that visually impaired individuals are valued, respected, and treated with dignity in all our programs.',
			icon: '🌟'
		},
		{
			title: 'Community Support',
			description: 'We create a nurturing community environment where visually impaired individuals can thrive and support each other.',
			icon: '❤️'
		}
	]

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<LoadingSpinner size="lg" />
					<p className="mt-4 text-gray-600">Loading about information...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Content</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<Button onClick={fetchAboutData}>Try Again</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="py-16 bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header Section */}
				<div className="text-center mb-16">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						About Urjja Pratishthan Prakashalay
					</h1>
					<p className="text-xl text-gray-600 max-w-4xl mx-auto">
						An NGO dedicated to supporting visually impaired individuals - Enabling vision through education and opportunity since 2014
					</p>
				</div>

				{/* Vision & Mission Section */}
				{aboutData.visionMission && (
					<div className="mb-16">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<Card className="p-8 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
								<div className="text-center">
									<div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
										<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									</div>
									<h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
									<p className="text-lg text-gray-700 leading-relaxed">
										{aboutData.visionMission?.vision || "Our vision is to create a world where visually impaired individuals are valued, respected, and fully included in all aspects of society. We envision a society where barriers to education, employment, and social participation are eliminated, and where visually impaired individuals can achieve their dreams and aspirations."}
									</p>
								</div>
							</Card>

							<Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
								<div className="text-center">
									<div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
										<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
									</div>
									<h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
									<p className="text-lg text-gray-700 leading-relaxed">
										{aboutData.visionMission?.mission || "Our mission is to foster the holistic development of visually impaired individuals by providing them with the necessary resources and support to excel in academics, develop life skills, and achieve financial independence. We are committed to illuminating their lives through comprehensive support and empowerment."}
									</p>
								</div>
							</Card>
						</div>
					</div>
				)}

				{/* Our Story Section */}
				<div className="mb-16">
					<Card className="p-8 lg:p-12">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
							<div>
								<h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
								<div className="space-y-4 text-gray-700 leading-relaxed">
									<p>
										{aboutData.story?.journey || 'Established in 2014 by Mr. Pankaj Kulkarni, Urjja Pratishthan Prakashalay was born from a deep commitment to supporting visually impaired individuals in Bhosari, Pune.'}
									</p>
									<p>
										At Urjja Pratishthan Prakashalay, we are committed to illuminating the lives of visually impaired students. 
										Our NGO aims to provide holistic support to visually impaired individuals, offering shelter, daily meals, 
										education, and skill development opportunities to empower these individuals to lead independent and fulfilling lives.
									</p>
									<p>
										We have developed a comprehensive approach to supporting visually impaired individuals, focusing on their 
										overall well-being, empowerment, and integration into society. Our center offers more than just a place to learn; 
										it is a safe haven where students receive not only educational opportunities but also essential support systems 
										that contribute to their overall development.
									</p>
									<p>
										Our holistic approach includes providing comprehensive support addressing physical, emotional, and educational needs. 
										This includes offering shelter, nutritious meals, healthcare assistance, academic support, and opportunities for 
										skill development that enable our beneficiaries to achieve financial independence.
									</p>
								</div>
							</div>
							<div className="relative">
								<Image 
									src={aboutImage} 
									alt="Students and staff at Urjja Pratishthan Prakashalay" 
									className="rounded-lg shadow-lg w-full h-96 object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
							</div>
						</div>
					</Card>
				</div>

				{/* Statistics Section */}
				<div className="mb-16">
					<h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Impact in Numbers</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
						{statistics.map((stat, index) => (
							<Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
								<div className="text-3xl mb-3">{stat.icon}</div>
								<div className="text-2xl font-bold text-primary-600 mb-2">{stat.value}</div>
								<div className="text-sm text-gray-600 font-medium">{stat.label}</div>
							</Card>
						))}
					</div>
				</div>

				{/* Core Values Section */}
				<div className="mb-16">
					<h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{coreValues.map((value, index) => (
							<Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
								<div className="text-center">
									<div className="text-4xl mb-4">{value.icon}</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
									<p className="text-gray-600 leading-relaxed">{value.description}</p>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* Team Section */}
				<div className="mb-16">
					<h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{teamMembers.map((member) => (
							<Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
								<div className="aspect-w-3 aspect-h-4">
									<img 
										src={member.image} 
										alt={member.name}
										className="w-full h-64 object-cover"
										onError={(e) => {
											e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=256&background=22c55e&color=ffffff`
										}}
									/>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
									<p className="text-primary-600 font-medium mb-3">{member.role}</p>
									<p className="text-sm text-gray-600 mb-3 leading-relaxed">{member.bio}</p>
									<p className="text-xs text-gray-500 font-medium">{member.qualifications}</p>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* Call to Action Section */}
				<div className="text-center">
					<Card className="p-12 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Join Our Mission
						</h2>
						<p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
							Be part of our journey to create lasting change. Whether through volunteering, 
							donations, or partnerships, every contribution makes a difference.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/get-involved">
								<Button size="lg" className="w-full sm:w-auto">
									Become a Volunteer
								</Button>
							</Link>
							<Link to="/donate">
								<Button variant="outline" size="lg" className="w-full sm:w-auto">
									Make a Donation
								</Button>
							</Link>
							<Link to="/contact">
								<Button variant="outline" size="lg" className="w-full sm:w-auto">
									Partner with Us
								</Button>
							</Link>
						</div>
					</Card>
				</div>
			</div>
		</div>
	)
}
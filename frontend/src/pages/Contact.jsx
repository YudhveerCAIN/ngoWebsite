import { useState } from 'react'
import ContactForm from '../components/forms/ContactForm'
import { Card } from '../components/ui'

export default function Contact() {
	const [showForm, setShowForm] = useState(false)

	const handleContactSuccess = (inquiry) => {
		console.log('Contact inquiry submitted:', inquiry)
	}

	return (
		<div className="py-16 bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Connect with Us
					</h1>
					<p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
						Thank you for considering reaching out to Urjja Pratishthan Prakashalay. Your interest in our organization and mission means the world to us. We value every connection and interaction, and we're here to assist you in any way we can.
					</p>
					<p className="text-lg text-gray-600 max-w-3xl mx-auto">
						Whether you have questions, feedback, or would like to get involved in supporting visually impaired individuals, we welcome your communication and look forward to connecting with you.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
					{/* Contact Information */}
					<div className="space-y-8">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
							<div className="space-y-6">
								{/* Address */}
								<div className="flex items-start space-x-4">
									<div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">Address</h3>
										<p className="text-gray-600 mt-1">
											Urjja Pratishthan Prakashalay<br />
											Survey No 125/1A, Shivshambho Colony<br />
											Near Astra Vyasanmukti Kendra<br />
											Bhosari, Pune - 411038<br />
											Maharashtra, India
										</p>
									</div>
								</div>

								{/* Phone */}
								<div className="flex items-start space-x-4">
									<div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">Phone</h3>
										<p className="text-gray-600 mt-1">
											<a href="tel:+919665205335" className="hover:text-primary-600">
												+91 96652 05335
											</a>
										</p>
										<p className="text-sm text-gray-500">Mon-Fri 9:00 AM - 6:00 PM</p>
									</div>
								</div>

								{/* Email */}
								<div className="flex items-start space-x-4">
									<div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">Email</h3>
										<p className="text-gray-600 mt-1">
											<a href="mailto:contact@urjjapratishthan.in" className="hover:text-primary-600">
												contact@urjjapratishthan.in
											</a>
										</p>
										<p className="text-sm text-gray-500">We'll respond within 24 hours</p>
									</div>
								</div>
							</div>
						</div>

						{/* Office Hours */}
						<Card className="p-6">
							<h3 className="font-semibold text-gray-900 mb-4">Office Hours</h3>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Monday - Friday</span>
									<span className="text-gray-900">9:00 AM - 6:00 PM</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Saturday</span>
									<span className="text-gray-900">10:00 AM - 4:00 PM</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Sunday</span>
									<span className="text-gray-900">Closed</span>
								</div>
							</div>
							<p className="text-xs text-gray-500 mt-4">
								*Emergency contact available 24/7 for urgent matters
							</p>
						</Card>

						{/* Social Media */}
						<div>
							<h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
							<div className="flex space-x-4">
								<a href="#" className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors">
									<svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
										<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
									</svg>
								</a>
								<a href="#" className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors">
									<svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
										<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
									</svg>
								</a>
								<a href="#" className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors">
									<svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z"/>
									</svg>
								</a>
							</div>
						</div>
					</div>

					{/* Contact Form */}
					<div>
						<ContactForm onSuccess={handleContactSuccess} />
					</div>
				</div>

				{/* FAQ Section */}
				<div className="max-w-4xl mx-auto">
					<h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-6">
							<h3 className="font-semibold text-gray-900 mb-2">How can I volunteer?</h3>
							<p className="text-gray-600 text-sm">
								Visit our Get Involved page to fill out the volunteer registration form. We'll match you with opportunities based on your interests and availability.
							</p>
						</Card>
						<Card className="p-6">
							<h3 className="font-semibold text-gray-900 mb-2">Are donations tax-deductible?</h3>
							<p className="text-gray-600 text-sm">
								Yes, all donations to our organization are eligible for tax deduction under Section 80G of the Income Tax Act.
							</p>
						</Card>
						<Card className="p-6">
							<h3 className="font-semibold text-gray-900 mb-2">How do you use donations?</h3>
							<p className="text-gray-600 text-sm">
								60% goes to education programs, 25% to community outreach, and 15% to skill development. We maintain full transparency in our annual reports.
							</p>
						</Card>
						<Card className="p-6">
							<h3 className="font-semibold text-gray-900 mb-2">Can organizations partner with you?</h3>
							<p className="text-gray-600 text-sm">
								Absolutely! We welcome partnerships with corporations, educational institutions, and other NGOs. Contact us to discuss collaboration opportunities.
							</p>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}

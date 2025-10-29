import { useState } from 'react'
import { Card } from '../components/ui'

export default function Legal() {
	const [activeTab, setActiveTab] = useState('privacy')

	const tabs = [
		{ id: 'privacy', label: 'Privacy Policy' },
		{ id: 'terms', label: 'Terms & Conditions' },
	]

	return (
		<div className="py-16 bg-gray-50 min-h-screen">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Legal Information
					</h1>
					<p className="text-xl text-gray-600">
						Our commitment to transparency and your rights
					</p>
				</div>

				{/* Tabs */}
				<div className="flex justify-center mb-8">
					<div className="flex bg-white rounded-lg p-1 shadow-sm">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
									activeTab === tab.id
										? 'bg-primary-600 text-white'
										: 'text-gray-600 hover:text-gray-900'
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				{/* Content */}
				<Card className="p-8">
					{activeTab === 'privacy' && (
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
							<div className="prose prose-lg max-w-none text-gray-700">
								<p className="mb-4">
									Urjja Pratishthan collects information from the users in a number of ways, for example when the user:
								</p>
								<ul className="list-disc pl-6 mb-4">
									<li>Makes a donation</li>
									<li>Signs up for a campaign</li>
									<li>Signs up to stay updated</li>
								</ul>
								
								<p className="mb-4">
									While forwarding a donation to Urjja Pratishthan the well-wishers have to submit some personal information as it would help us ensure genuine contributions:
								</p>
								<ul className="list-disc pl-6 mb-4">
									<li>Your name</li>
									<li>Your email and mailing address</li>
									<li>Your telephone numbers</li>
									<li>Your payment processing details</li>
									<li>Any other data as required</li>
								</ul>

								<p className="mb-4">
									Urjja Pratishthan does not collect or record the user's personal information unless he/she chooses to provide it.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Use of Personal Information</h3>
								<p className="mb-4">
									General browsing of the Urjja Pratishthan website is anonymous and it does not register the user's personal information except the time, date, and place of visits and the name of the internet service provider. This data is used only for statistics and diagnosis.
								</p>
								<p className="mb-4">
									By signing up for various services offered by Urjja Pratishthan, the user explicitly authorizes us to collect information based on the user's usage. The information is used to help provide a better experience to the user and is used as per the user's specified instructions.
								</p>
								<p className="mb-4">
									Urjja Pratishthan keeps the user information strictly confidential and this information is secured safely. All relevant information collected through the Urjja Pratishthan website is handled and used by internal and/or authorized officials only. It is never shared with any external agencies or third-party individuals.
								</p>

								<p className="mb-4">
									Urjja Pratishthan uses the information given to it in the following ways:
								</p>
								<ul className="list-disc pl-6 mb-4">
									<li>To keep an accurate record of all the donations received</li>
									<li>To update users about its happenings and developments through bulletins and newsletters, with an option of not to subscribe for the same</li>
									<li>To make sure the user is receiving the most appropriate and relevant information</li>
									<li>To find out more about the people who are visiting the Urjja Pratishthan website, donating, or joining its campaigns</li>
								</ul>

								<p className="mb-4">
									Usually, Urjja Pratishthan does not store user data. In case of specific sign-ups, the data is stored as per user request. The user can opt to delete all the information he/she has provided by simply requesting such by mail. All information, without exception, will be deleted in two working days.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Privacy of e-mail lists</h3>
								<p className="mb-4">
									Individuals who join Urjja Pratishthan's mailing lists via its website or through its campaigning engagements are added to its email database. Urjja Pratishthan does not sell, rent, loan, trade, or lease the addresses on our lists to anyone.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Cookie Policy</h3>
								<p className="mb-4">
									Cookies are pieces of electronic information that will be sent by the Urjja Pratishthan when a user visits the website. These will be placed in the hard disk of the user's computer and enable Urjja Pratishthan to recognize the user when he/she visits the website again.
								</p>
								<p className="mb-4">
									The user can configure his/her browser so that it responds to cookies the way he/she deems fit. For example, you make want to accept all cookies, reject them all, or get notified when a cookie is sent. The users may check their browser's settings to modify cookie behavior as per individual behavior.
								</p>
								<p className="mb-4">
									If a user disables the use of cookies on the web browser or removes or rejects specific cookies from Urjja Pratishthan's website or linked sites then he/she may not be able to use the website as it is intended.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Payment Gateway</h3>
								<p className="mb-4">
									Urjja Pratishthan uses well-recognized and proven technology for payments. Payment information is transferred by the use of an SSL connection which offers the highest degree of security that the donor's browser is able to support.
								</p>
								<p className="mb-4">
									Several layers of built-in security, including an advanced firewall system, encryption of credit card numbers, and use of passwords, protect the collected information.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">External Web Services</h3>
								<p className="mb-4">
									The Urjja Pratishthan website contains links to other websites for the benefit of its visitors. This Privacy Policy does not apply to such other websites.
								</p>
								<p className="mb-4">
									Urjja Pratishthan is not expressly or impliedly responsible for, or liable for any loss or damage caused to a user by the collection, use, and retention of Personal Information by such website in any manner whatsoever. It is important that the users review the privacy policies of all websites they visit before disclosing any information to such websites.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Changes to Privacy Policy</h3>
								<p className="mb-4">
									As and when the need arises, Urjja Pratishthan may alter its privacy policy in accordance with the latest technology and trends. It will provide you with timely notice of these changes. The users may reach out to Urjja Pratishthan if they have any queries about any changes made to its practices.
								</p>
								<p className="mb-4">
									If you have any questions at all about Urjja Pratishthan's privacy policy, please write to us at: contact@urjjapratishthan.in
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Refund and Cancellation Policy</h3>
								<p className="mb-4">
									Welcome to this website of Urjja Pratishthan. Our policy on refund and cancellation of donations received for social cause:
								</p>
								<ul className="list-disc pl-6 mb-4">
									<li>No refund/cancellation for the donated amount by any donor will not be entertained, the online donations through the online payment gateway.</li>
									<li>No cash or refund of money will be allowed.</li>
									<li>If any in-kind support is received by the donor from anywhere the material will be reached to the poorest of the poorer communities.</li>
									<li>Once received the donation for a cause will not be refunded to the donor. No cancellation is to be made. The donation will be used for community development, children's education, or women's empowerment.</li>
								</ul>
							</div>
						</div>
					)}

					{activeTab === 'terms' && (
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h2>
							<div className="prose prose-lg max-w-none text-gray-700">
								<p className="mb-4">
									These Terms of Service govern your use of the website located at https://urjjapratishthan.in and any related services provided by Urjja Pratishthan. By accessing https://urjjapratishthan.in, you agree to abide by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with these Terms of Service, you are prohibited from using or accessing this website or using any other services provided by Urjja Pratishthan.
								</p>
								<p className="mb-4">
									We, Urjja Pratishthan, reserve the right to review and amend any of these Terms of Service at our sole discretion. Upon doing so, we will update this page. Any changes to these Terms of Service will take effect immediately from the date of publication.
								</p>
								<p className="mb-4">
									These Terms of Service were last updated on 8 October 2022.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Limitations of Use</h3>
								<p className="mb-4">
									By using this website, you warrant on behalf of yourself, your users, and other parties you represent that you will not:
								</p>
								<ol className="list-decimal pl-6 mb-4">
									<li>modify, copy, prepare derivative works of, decompile, or reverse engineer any materials and software contained on this website;</li>
									<li>remove any copyright or other proprietary notations from any materials and software on this website;</li>
									<li>transfer the materials to another person or "mirror" the materials on any other server;</li>
									<li>knowingly or negligently use this website or any of its associated services in a way that abuses or disrupts our networks or any other service Urjja Pratishthan provides;</li>
									<li>use this website or its associated services to transmit or publish any harassing, indecent, obscene, fraudulent, or unlawful material;</li>
									<li>use this website or its associated services in violation of any applicable laws or regulations;</li>
									<li>use this website in conjunction with sending unauthorized advertising or spam;</li>
									<li>harvest, collect, or gather user data without the user's consent; or</li>
									<li>use this website or its associated services in such a way that may infringe the privacy, intellectual property rights, or other rights of third parties.</li>
								</ol>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Intellectual Property</h3>
								<p className="mb-4">
									The intellectual property in the materials contained in this website is owned by or licensed to Urjja Pratishthan and is protected by applicable copyright and trademark law. We grant our users permission to download one copy of the materials for personal, non-commercial transitory use.
								</p>
								<p className="mb-4">
									This constitutes the grant of a license, not a transfer of title. This license shall automatically terminate if you violate any of these restrictions or the Terms of Service, and may be terminated by Urjja Pratishthan at any time.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">User-Generated Content</h3>
								<p className="mb-4">
									You retain your intellectual property ownership rights over content you submit to us for publication on our website. We will never claim ownership of your content, but we do require a license from you in order to use it.
								</p>
								<p className="mb-4">
									When you use our website or its associated services to post, upload, share, or otherwise transmit content covered by intellectual property rights, you grant to us a non-exclusive, royalty-free, transferable, sub-licensable, worldwide license to use, distribute, modify, run, copy, publicly display, translate, or otherwise create derivative works of your content in a manner that is consistent with your privacy preferences and our Privacy Policy.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Liability</h3>
								<p className="mb-4">
									Our website and the materials on our website are provided on an 'as is' basis. To the extent permitted by law, Urjja Pratishthan makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property, or other violation of rights.
								</p>
								<p className="mb-4">
									In no event shall Urjja Pratishthan or its suppliers be liable for any consequential loss suffered or incurred by you or any third party arising from the use or inability to use this website or the materials on this website, even if Urjja Pratishthan or an authorized representative has been notified, orally or in writing, of the possibility of such damage.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Accuracy of Materials</h3>
								<p className="mb-4">
									The materials appearing on our website are not comprehensive and are for general information purposes only. Urjja Pratishthan does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on this website, or otherwise relating to such materials or on any resources linked to this website.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Refund Policy</h3>
								<p className="mb-4">
									We have a 7-day refund policy. To initiate a refund, contact us via the Helpdesk Button on the home page. The refunds will be processed within 5-7 working days to the same mode of payment.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Links</h3>
								<p className="mb-4">
									Urjja Pratishthan has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement, approval, or control by the Urjja Pratishthan of the site. Use of any such linked site is at your own risk and we strongly advise you to make your own investigations with respect to the suitability of those sites.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Right to Terminate</h3>
								<p className="mb-4">
									We may suspend or terminate your right to use our website and terminate these Terms of Service immediately upon written notice to you for any breach of these Terms of Service.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Severance</h3>
								<p className="mb-4">
									Any term of these Terms of Service which is wholly or partially void or unenforceable is severed to the extent that it is void or unenforceable. The validity of the remainder of these Terms of Service is not affected.
								</p>

								<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Governing Law</h3>
								<p className="mb-4">
									These Terms of Service are governed by and construed in accordance with the laws of India. You irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
								</p>
							</div>
						</div>
					)}
				</Card>
			</div>
		</div>
	)
}

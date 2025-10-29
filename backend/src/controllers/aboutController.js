export async function getStory(req, res, next) {
	try {
		res.json({
			foundedYear: 2013,
			journey: 'Started in 2013 with a mission to enable vision through education and opportunity.',
			milestones: [
				{
					year: 2013,
					title: 'Foundation',
					description: 'Urjja Pratishthan Prakashalay was founded with a vision to transform lives through education.'
				},
				{
					year: 2015,
					title: 'First 100 Students',
					description: 'Reached our first milestone of supporting 100 students with educational resources.'
				},
				{
					year: 2017,
					title: 'Program Expansion',
					description: 'Expanded beyond education to include healthcare and vocational training programs.'
				},
				{
					year: 2019,
					title: 'Community Outreach',
					description: 'Launched community outreach programs reaching rural and tribal areas.'
				},
				{
					year: 2021,
					title: '1000+ Lives Impacted',
					description: 'Celebrated impacting over 1000 lives through our comprehensive programs.'
				},
				{
					year: 2024,
					title: 'Digital Innovation',
					description: 'Integrated digital platforms to enhance program delivery and reach.'
				}
			],
			achievements: [
				'Over 1,250 students supported',
				'48+ programs successfully conducted',
				'85+ active volunteers',
				'25+ communities reached',
				'92% program completion rate',
				'150+ job placements facilitated'
			]
		});
	} catch (err) {
		next(err);
	}
}

export async function getVisionMission(req, res, next) {
	try {
		res.json({
			vision: 'A society where every child has the opportunity to learn and thrive, regardless of their background or circumstances.',
			mission: 'To empower underserved communities through comprehensive education, skill development, healthcare support, and inclusive programs that create sustainable positive change.',
			values: [
				{
					name: 'Empowerment',
					description: 'We believe in empowering individuals with knowledge, skills, and opportunities to transform their lives.'
				},
				{
					name: 'Inclusivity',
					description: 'Our programs are designed to be inclusive and accessible to all, regardless of background or circumstances.'
				},
				{
					name: 'Excellence',
					description: 'We strive for excellence in everything we do, from program delivery to community engagement.'
				},
				{
					name: 'Transparency',
					description: 'We maintain complete transparency in our operations, funding, and impact measurement.'
				},
				{
					name: 'Sustainability',
					description: 'We focus on creating sustainable solutions that have long-term positive impact on communities.'
				},
				{
					name: 'Collaboration',
					description: 'We believe in the power of collaboration and work closely with partners, volunteers, and communities.'
				}
			]
		});
	} catch (err) {
		next(err);
	}
}

export async function getTeam(req, res, next) {
	try {
		res.json([
			{
				id: 1,
				name: 'Dr. Rajesh Kumar',
				role: 'Founder & Director',
				bio: 'With over 20 years of experience in education and social work, Dr. Kumar founded Urjja Pratishthan Prakashalay to create lasting change in underserved communities.',
				qualifications: 'Ph.D. in Education, M.A. in Social Work',
				email: 'rajesh.kumar@urjjapratishthan.org',
				linkedin: 'https://linkedin.com/in/rajeshkumar'
			},
			{
				id: 2,
				name: 'Priya Sharma',
				role: 'Program Manager',
				bio: 'Priya oversees our educational programs and ensures quality delivery of services to our beneficiaries.',
				qualifications: 'M.Ed., B.A. in Psychology',
				email: 'priya.sharma@urjjapratishthan.org',
				linkedin: 'https://linkedin.com/in/priyasharma'
			},
			{
				id: 3,
				name: 'Amit Patel',
				role: 'Community Outreach Coordinator',
				bio: 'Amit leads our community engagement initiatives and builds partnerships with local organizations.',
				qualifications: 'M.A. in Social Work, B.A. in Sociology',
				email: 'amit.patel@urjjapratishthan.org',
				linkedin: 'https://linkedin.com/in/amitpatel'
			},
			{
				id: 4,
				name: 'Sunita Devi',
				role: 'Volunteer Coordinator',
				bio: 'Sunita manages our volunteer programs and ensures meaningful engagement opportunities for all volunteers.',
				qualifications: 'B.A. in Social Work, Diploma in Community Development',
				email: 'sunita.devi@urjjapratishthan.org',
				linkedin: 'https://linkedin.com/in/sunitadevi'
			}
		]);
	} catch (err) {
		next(err);
	}
}

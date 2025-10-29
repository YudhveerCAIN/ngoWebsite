import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Programs from './pages/Programs.jsx'

import GetInvolved from './pages/GetInvolved.jsx'
import Contact from './pages/Contact.jsx'
import Legal from './pages/Legal.jsx'
import Donate from './pages/Donate.jsx'
import Gallery from './pages/Gallery.jsx'

// Admin imports
import { AuthProvider } from './context/AuthContext.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ index: true, element: <Home /> },
			{ path: 'about', element: <About /> },
			{ path: 'programs', element: <Programs /> },

			{ path: 'get-involved', element: <GetInvolved /> },
			{ path: 'contact', element: <Contact /> },
			{ path: 'gallery', element: <Gallery /> },
			{ path: 'legal', element: <Legal /> },
			{ path: 'donate', element: <Donate /> },
		],
	},
	{
		path: '/admin/login',
		element: (
			<AuthProvider>
				<AdminLogin />
			</AuthProvider>
		),
	},
	{
		path: '/admin',
		element: (
			<AuthProvider>
				<ProtectedRoute requireAdmin={true}>
					<AdminDashboard />
				</ProtectedRoute>
			</AuthProvider>
		),
	},
	// Additional admin routes will be added here in future tasks
])

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
)

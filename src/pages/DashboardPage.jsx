import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../Dashboard.css';
import MinistryImage from '../Images/ministry-of-culture-republic-of-lebanon.jpg';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardPage = () => {
    const [userData, setUserData] = useState({});
    const [projectsData, setProjectsData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [chartData, setChartData] = useState({
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Active Projects',
                data: [12, 19, 3, 5, 2, 3],
                fill: false,
                borderColor: '#76b852',
                tension: 0.1
            }
        ]
    });

    const navigate = useNavigate();  // Using useNavigate instead of useHistory

    useEffect(() => {
        // Simulate fetching data
        setUserData({ name: 'Admin', usersCount: 1500 });
        setProjectsData([{ name: 'Project A', status: 'Completed' }, { name: 'Project B', status: 'Ongoing' }]);
        setAlerts([
            { id: 1, message: 'New Registration Request' },
            { id: 2, message: 'Pending Approval for Project B' }
        ]);
    }, []);

    // Function to handle logout
    const handleLogout = () => {
        // Remove authentication data from localStorage or sessionStorage
        localStorage.removeItem('authToken');  // If using token-based authentication
        sessionStorage.removeItem('authToken'); // Remove token from session storage (if applicable)

        // Optionally, clear state if using React Context or Redux for user state management
        // Example: setUserData({});

        // Redirect user to the login page
        navigate('/'); // Use navigate() for redirection
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={MinistryImage} alt="Ministry Logo" className="sidebar-logo" />
                    <h2 className="sidebar-title">Ministry of Culture</h2>
                </div>
                <nav className="nav-links">
                    <ul>
                        <li><a href="/applications" className="nav-link">Applications Table</a></li>
                        <li><a href="/profile" className="nav-link">Profile</a></li>
                        <li><a href="/settings" className="nav-link">Settings</a></li>
                        <li><button className="nav-link logout" onClick={handleLogout}>Logout</button></li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <h1 className="header-title">Welcome to the Ministry Dashboard</h1>
                    <div className="user-info">
                        {/* We added the onClick event handler here */}
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </header>

                {/* Cards Section */}
                <section className="dashboard-cards">
                    <div className="card total-users">
                        <div className="card-header">
                            <h3>Total Users</h3>
                        </div>
                        <div className="card-body">
                            <p className="stat-number">{userData.usersCount}</p>
                        </div>
                    </div>

                    <div className="card active-projects">
                        <div className="card-header">
                            <h3>Active Projects</h3>
                        </div>
                        <div className="card-body">
                            <p className="stat-number">{projectsData.length}</p>
                        </div>
                    </div>

                    <div className="card pending-requests">
                        <div className="card-header">
                            <h3>Pending Requests</h3>
                        </div>
                        <div className="card-body">
                            <p className="stat-number">{alerts.length}</p>
                        </div>
                    </div>
                </section>

                {/* Line Chart */}
                <section className="chart-section">
                    <h2>Project Activity</h2>
                    <Line data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Monthly Project Trends' } } }} />
                </section>

                {/* Alerts Section */}
                <section className="recent-alerts">
                    <h2>Recent Alerts</h2>
                    <ul>
                        {alerts.map(alert => (
                            <li key={alert.id}>{alert.message}</li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
};

export default DashboardPage;

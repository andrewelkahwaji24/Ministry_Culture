import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firestore methods
import { db } from '../firebase'; // Import your Firebase DB instance
import '../Dashboard.css';
import MinistryImage from '../Images/ministry-of-culture-republic-of-lebanon.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardPage = () => {
    const [userData, setUserData] = useState({});
    const [projectsData, setProjectsData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [decisionsData, setDecisionsData] = useState([]);
    const [applicationsData, setApplicationsData] = useState([]);
    const [totalDecisions, setTotalDecisions] = useState(0);
    const [totalApplications, setTotalApplications] = useState(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setUserData({ name: 'Admin', usersCount: 1500 });
        setProjectsData([{ name: 'Project A', status: 'Completed' }, { name: 'Project B', status: 'Ongoing' }]);
        setAlerts([{ id: 1, message: 'New Registration Request' }, { id: 2, message: 'Pending Approval for Project B' }]);

        fetchTotals();
        fetchMonthlyData();
    }, []);

    // Fetch total decisions and applications from Firestore
    const fetchTotals = async () => {
        try {
            // Fetch total number of decisions
            const decisionsCollection = collection(db, 'decisions');
            const decisionsSnapshot = await getDocs(decisionsCollection);
            setTotalDecisions(decisionsSnapshot.size);

            // Fetch total number of applications
            const applicationsCollection = collection(db, 'applications');
            const applicationsSnapshot = await getDocs(applicationsCollection);
            setTotalApplications(applicationsSnapshot.size);
        } catch (error) {
            console.error('Error fetching totals:', error);
        }
    };

    // Fetch monthly data for decisions and applications in 2025
    const fetchMonthlyData = async () => {
        try {
            const currentYear = 2025;

            // Fetch monthly decisions data for 2025
            const decisionsCollection = collection(db, 'decisions');
            const decisionsQuery = query(
                decisionsCollection,
                where('timestamp', '>=', new Date(currentYear, 0, 1)),  // Jan 1, 2025
                where('timestamp', '<', new Date(currentYear + 1, 0, 1))  // Dec 31, 2025
            );
            const decisionsSnapshot = await getDocs(decisionsQuery);
            const decisionsByMonth = Array(12).fill(0);

            decisionsSnapshot.forEach(doc => {
                const timestamp = doc.data().timestamp;
                const month = timestamp.toDate().getMonth(); // .toDate() converts Firestore Timestamp to JavaScript Date
                decisionsByMonth[month] += 1;
            });
            setDecisionsData(decisionsByMonth);

            // Fetch monthly applications data for 2025
            const applicationsCollection = collection(db, 'applications');
            const applicationsQuery = query(
                applicationsCollection,
                where('timestamp', '>=', new Date(currentYear, 0, 1)),  // Jan 1, 2025
                where('timestamp', '<', new Date(currentYear + 1, 0, 1))  // Dec 31, 2025
            );
            const applicationsSnapshot = await getDocs(applicationsQuery);
            const applicationsByMonth = Array(12).fill(0);

            applicationsSnapshot.forEach(doc => {
                const timestamp = doc.data().timestamp;
                const month = timestamp.toDate().getMonth(); // .toDate() converts Firestore Timestamp to JavaScript Date
                applicationsByMonth[month] += 1;
            });
            setApplicationsData(applicationsByMonth);

        } catch (error) {
            console.error('Error fetching monthly data:', error);
        }
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        navigate('/');
    };

    // Handle sidebar toggle
    const handleToggle = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // Chart data for decisions and applications in 2025
    const decisionsChartData = {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        datasets: [
            {
                label: 'القرارات',
                data: decisionsData,
                fill: false,
                borderColor: '#4e73df',
                tension: 0.1
            }
        ]
    };

    const applicationsChartData = {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        datasets: [
            {
                label: 'الطلبات',
                data: applicationsData,
                fill: false,
                borderColor: '#1cc88a',
                tension: 0.1
            }
        ]
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>وزارة الثقافة - الإدارة المشتركة</h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <a href="/dashboard">
                                <i className="icon fas fa-home"></i>
                                لوحة التحكم
                            </a>
                        </li>
                        <li>
                            <a href="/applications">
                                <i className="icon fas fa-table"></i>
                                الطلبات
                            </a>
                        </li>
                        <li>
                            <a href="/decisions">
                                <i className="icon fas fa-gavel"></i>
                                القرارات
                            </a>
                        </li>
                        <li>
                            <a href="/profile">
                                <i className="icon fas fa-user"></i>
                                الملف الشخصي
                            </a>
                        </li>
                        <li>
                            <a href="/settings">
                                <i className="icon fas fa-cog"></i>
                                الإعدادات
                            </a>
                        </li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout}>
                        <i className="icon fas fa-sign-out-alt"></i>
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <h1 className="header-title">مرحبًا بك في لوحة التحكم</h1>
                    <div className="user-info">
                        <button className="logout-button" onClick={handleLogout}>تسجيل الخروج</button>
                    </div>
                </header>

                {/* Cards Section */}
                <section className="dashboard-cards">
                    <div className="card total-users">
                        <div className="card-header">
                            <h3>إجمالي المستخدمين</h3>
                        </div>
                        <div className="card-body">
                            <p className="stat-number">{userData.usersCount}</p>
                        </div>
                    </div>

                    <div className="card total-decisions">
                        <div className="card-header">
                            <h3>إجمالي القرارات</h3>
                        </div>
                        <div className="card-body">
                            <p className="stat-number">{totalDecisions}</p>
                        </div>
                    </div>

                    <div className="card total-applications">
                        <div className="card-header">
                            <h3>إجمالي الطلبات</h3>
                        </div>
                        <div className="card-body">
                            <p className="stat-number">{totalApplications}</p>
                        </div>
                    </div>

                    <div className="card active-projects">
                        <div className="card-header">
                            <h3>المشاريع النشطة</h3>
                        </div>
                        <div className="card-body">
                            <p className="stat-number">{projectsData.length}</p>
                        </div>
                    </div>

                    <div className="card pending-requests">
                        <div className="card-header">
                            <h3>الطلبات المعلقة</h3>
                        </div>
                        <div className="card-body">
                            <p className="stat-number">{alerts.length}</p>
                        </div>
                    </div>
                </section>

                {/* Mini Charts Section */}
                <section className="mini-charts">
                    <div className="mini-chart">
                        <h3>القرارات في 2025</h3>
                        <Line data={decisionsChartData} options={{
                            responsive: true,
                            plugins: { title: { display: true, text: 'القرارات لكل شهر' } },
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }} />
                    </div>

                    <div className="mini-chart">
                        <h3>الطلبات في 2025</h3>
                        <Line data={applicationsChartData} options={{
                            responsive: true,
                            plugins: { title: { display: true, text: 'الطلبات لكل شهر' } },
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }} />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DashboardPage;

import React, { useState, useEffect } from 'react';
import { Link , Navigate , useNavigate} from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'; // Modular imports
import { db } from '../firebase'; // Importing the db
import MinistryImage from '../Images/ministry-of-culture-republic-of-lebanon.jpg';
import '../Dashboard.css';



const ApplicationsTable = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTransferHistoryModal, setShowTransferHistoryModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isTransferEditMode, setIsTransferEditMode] = useState(false);
    const [currentApplication, setCurrentApplication] = useState({
        applicationId: '',
        addressedTo: '',
        addressedFrom: '',
        description: '',
        dateOfReception: '',
        transferHistory: [],
        url: '' // Add URL property
    });
    const [newTransfer, setNewTransfer] = useState({ date: '', location: '', status: '' });
    const [editingTransfer, setEditingTransfer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [applicationsPerPage] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const applicationsCollection = collection(db, 'applications');
                const snapshot = await getDocs(applicationsCollection);
                const applicationsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    transferHistory: doc.data().transferHistory || [], // Ensure transferHistory is an array
                }));
                setApplications(applicationsList);
            } catch (error) {
                console.error('Error fetching data from Firestore: ', error);
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, []);

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditMode(false);
        setCurrentApplication({
            applicationId: '',
            addressedTo: '',
            addressedFrom: '',
            description: '',
            dateOfReception: '',
            transferHistory: [],
            url: '' // Reset URL
        });
    };

    const handleTransferHistoryClose = () => {
        setShowTransferHistoryModal(false);
        setNewTransfer({ date: '', location: '', status: '' });
        setEditingTransfer(null);
        setIsTransferEditMode(false);
    };

    const handleEditApplication = (id) => {
        const application = applications.find(app => app.id === id);
        setCurrentApplication(application);
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentApplication(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNewTransferChange = (e) => {
        const { name, value } = e.target;
        setNewTransfer(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleShowTransferHistory = (application) => {
        if (application.transferHistory && Array.isArray(application.transferHistory)) {
            setCurrentApplication(application);
            setShowTransferHistoryModal(true);
        } else {
            console.error('Transfer history is not an array or is undefined.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                const applicationRef = doc(db, 'applications', currentApplication.id);
                await updateDoc(applicationRef, {
                    ...currentApplication,
                });
                setApplications(applications.map(app =>
                    app.id === currentApplication.id ? currentApplication : app
                ));
            } else {
                const docRef = await addDoc(collection(db, 'applications'), {
                    ...currentApplication,
                });
                setApplications([...applications, { id: docRef.id, ...currentApplication }]);
            }
            handleModalClose();
        } catch (error) {
            console.error('Error adding/updating application: ', error);
        }
    };

    const handleLogout = () => {
        // Remove authentication data from localStorage or sessionStorage
        localStorage.removeItem('authToken');  // If using token-based authentication
        sessionStorage.removeItem('authToken'); // Remove token from session storage (if applicable)

        // Optionally, clear state if using React Context or Redux for user state management
        // Example: setUserData({});

        // Redirect user to the login page
        navigate('/'); // Use navigate() for redirection
    };

    const handleAddTransferHistory = async (e) => {
        e.preventDefault();
        try {
            const updatedTransferHistory = [...currentApplication.transferHistory, newTransfer];
            const applicationRef = doc(db, 'applications', currentApplication.id);
            await updateDoc(applicationRef, {
                transferHistory: updatedTransferHistory,
            });
            setCurrentApplication(prevState => ({
                ...prevState,
                transferHistory: updatedTransferHistory,
            }));
            handleTransferHistoryClose();
        } catch (error) {
            console.error('Error adding transfer history: ', error);
        }
    };

    const handleEditTransferHistory = (transfer) => {
        setEditingTransfer(transfer);
        setNewTransfer({
            date: transfer.date,
            location: transfer.location,
            status: transfer.status,
        });
        setIsTransferEditMode(true);
    };

    const handleUpdateTransferHistory = async (e) => {
        e.preventDefault();
        try {
            const updatedTransferHistory = currentApplication.transferHistory.map(transfer =>
                transfer === editingTransfer ? { ...editingTransfer, ...newTransfer } : transfer
            );
            const applicationRef = doc(db, 'applications', currentApplication.id);
            await updateDoc(applicationRef, {
                transferHistory: updatedTransferHistory,
            });
            setCurrentApplication(prevState => ({
                ...prevState,
                transferHistory: updatedTransferHistory,
            }));
            handleTransferHistoryClose();
        } catch (error) {
            console.error('Error updating transfer history: ', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 whenever the search term changes
    };

    const filteredApplications = searchTerm
        ? applications.filter(application =>
            (application.applicationId || '').toLowerCase() === searchTerm.toLowerCase()
        )
        : applications; // Show all applications if searchTerm is empty


    const indexOfLastApp = currentPage * applicationsPerPage;
    const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
    const currentApplications = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    function handleToggle() {

    }

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
                                لوحة القيادة

                            </a>
                        </li>
                        <li>
                            <a href="/applications">
                                <i className="icon fas fa-table"></i>
                                الطلبات                            </a>
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
                    <h1 className="header-title">نظرة عامة على الطلبات</h1>
                </header>

                {/* Search Bar */}
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="البحث برقم الطلب"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>


                {/* Add Application Button */}
                <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
                    إضافة طلب جديد
                </button>

                <div className="card table-card">
                    <div className="table-responsive">
                        <table className="table applications-table">
                            <thead className="table-light">
                            <tr>
                                <th>رقم الطلب</th>
                                <th>موجه إلى</th>
                                <th>موجه من</th>
                                <th>الوصف</th>
                                <th>تاريخ الاستلام</th>
                                <th>تاريخ التحويل</th>
                                <th>الإجراءات</th>
                                <th>رابط التحميل</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentApplications.map((application) => (
                                <tr key={application.id}>
                                    <td>{application.applicationId}</td>
                                    <td>{application.addressedTo}</td>
                                    <td>{application.addressedFrom}</td>
                                    <td>{application.description}</td>
                                    <td>{application.dateOfReception}</td>
                                    <td>
                                        <button
                                            className="btn btn-info"
                                            onClick={() => handleShowTransferHistory(application)}
                                        >
                                            Details
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleEditApplication(application.id)}
                                        >
                                            Edit
                                        </button>
                                    </td>

                                    <td>
                                        {application.url ? (
                                            <a href={application.url} target="_blank" rel="noopener noreferrer"
                                               className="btn btn-success">
                                                Download
                                            </a>
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <nav>
                    <ul className="pagination">
                        <li className="page-item">
                            <button
                                className="page-link"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                        </li>
                        {[...Array(Math.ceil(filteredApplications.length / applicationsPerPage)).keys()].map(page => (
                            <li key={page} className="page-item">
                                <button
                                    className="page-link"
                                    onClick={() => paginate(page + 1)}
                                >
                                    {page + 1}
                                </button>
                            </li>
                        ))}
                        <li className="page-item">
                            <button
                                className="page-link"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === Math.ceil(filteredApplications.length / applicationsPerPage)}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </main>

            {/* Modal for adding/editing applications */}
            {showModal && (
                <div className="modal show" style={{display: 'block'}} role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditMode ? 'Edit Application' : 'Add Application'}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleModalClose}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="applicationId" className="form-label">رقم الطلب</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="applicationId"
                                            name="applicationId"
                                            value={currentApplication.applicationId}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="addressedTo" className="form-label">موجه إلى</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="addressedTo"
                                            name="addressedTo"
                                            value={currentApplication.addressedTo}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="addressedFrom" className="form-label">موجه من</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="addressedFrom"
                                            name="addressedFrom"
                                            value={currentApplication.addressedFrom}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">الوصف</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            value={currentApplication.description}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="dateOfReception" className="form-label">تاريخ الاستلام</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="dateOfReception"
                                            name="dateOfReception"
                                            value={currentApplication.dateOfReception}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="url" className="form-label">URL</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            id="url"
                                            name="url"
                                            value={currentApplication.url}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary"
                                            onClick={handleModalClose}>Close
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {isEditMode ? 'Update Application' : 'Add Application'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal for Transfer History Details */}
            {showTransferHistoryModal && (
                <div className="modal show" style={{display: 'block'}} role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Transfer History</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleTransferHistoryClose}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>الموقع</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentApplication.transferHistory.length > 0 ? (
                                        currentApplication.transferHistory.map((transfer, index) => (
                                            <tr key={index}>
                                                <td>{transfer.date || 'غير متوفر'}</td>
                                                <td>{transfer.location || 'غير متوفر'}</td>
                                                <td>{transfer.status || 'غير متوفر'}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-warning"
                                                        onClick={() => handleEditTransferHistory(transfer)}
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">لا يوجد تاريخ تحويل متاح</td>
                                        </tr>
                                    )}

                                    </tbody>
                                </table>
                                <form
                                    onSubmit={isTransferEditMode ? handleUpdateTransferHistory : handleAddTransferHistory}>
                                    <div className="mb-3">
                                        <label htmlFor="date" className="form-label">تاريخ</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="date"
                                            name="date"
                                            value={newTransfer.date}
                                            onChange={handleNewTransferChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="location" className="form-label">الموقع</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="location"
                                            name="location"
                                            value={newTransfer.location}
                                            onChange={handleNewTransferChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="status" className="form-label">الحالة</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="status"
                                            name="status"
                                            value={newTransfer.status}
                                            onChange={handleNewTransferChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        {isTransferEditMode ? 'Update Transfer' : 'Add Transfer'}
                                    </button>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary"
                                        onClick={handleTransferHistoryClose}>إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationsTable;
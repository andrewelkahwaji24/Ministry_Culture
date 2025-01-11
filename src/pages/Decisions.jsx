import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'; // Modular imports
import { db } from '../firebase'; // Importing the db
import MinistryImage from '../Images/ministry-of-culture-republic-of-lebanon.jpg';
import '../Dashboard.css';

const DecisionsTable = () => {
    const navigate = useNavigate();
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentDecision, setCurrentDecision] = useState({
        decisionId: '',
        addressedTo: '',
        addressedFrom: '',
        description: '',
        dateOfDecision: '',
        additionalInformation: '',  // Additional Information field
        url: '' // Add URL property
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [decisionsPerPage] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const decisionsCollection = collection(db, 'decisions');
                const snapshot = await getDocs(decisionsCollection);
                const decisionsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    additionalInformation: doc.data().additionalInformation || '', // Ensure additional info is handled
                }));
                setDecisions(decisionsList);
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
        setCurrentDecision({
            decisionId: '',
            addressedTo: '',
            addressedFrom: '',
            description: '',
            dateOfDecision: '',
            additionalInformation: '', // Reset additional information
            url: ''
        });
    };

    const handleEditDecision = (id) => {
        const decision = decisions.find(app => app.id === id);
        setCurrentDecision(decision);
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentDecision(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                const decisionRef = doc(db, 'decisions', currentDecision.id);
                await updateDoc(decisionRef, {
                    ...currentDecision,
                });
                setDecisions(decisions.map(app =>
                    app.id === currentDecision.id ? currentDecision : app
                ));
            } else {
                const docRef = await addDoc(collection(db, 'decisions'), {
                    ...currentDecision,
                });
                setDecisions([...decisions, { id: docRef.id, ...currentDecision }]);
            }
            handleModalClose();
        } catch (error) {
            console.error('Error adding/updating decision: ', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        navigate('/'); // Redirect to login page
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 whenever the search term changes
    };

    const filteredDecisions = searchTerm
        ? decisions.filter(decision =>
            (decision.decisionId || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        : decisions;

    const indexOfLastDecision = currentPage * decisionsPerPage;
    const indexOfFirstDecision = indexOfLastDecision - decisionsPerPage;
    const currentDecisions = filteredDecisions.slice(indexOfFirstDecision, indexOfLastDecision);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جاري التحميل...</span>
                </div>
            </div>
        );
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
                            <a href="/decisions">
                                <i className="icon fas fa-table"></i>
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
                    <h1 className="header-title">نظرة عامة على القرارات</h1>
                    <p>هذا الفضاء مخصص لجميع القرارات الصادرة عن وزير الثقافة</p>
                </header>

                {/* Search Bar */}
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="البحث بواسطة رقم القرار"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Add Decision Button */}
                <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
                    إضافة قرار جديد
                </button>

                <div className="card table-card">
                    <div className="table-responsive">
                        <table className="table decisions-table">
                            <thead className="table-light">
                            <tr>
                                <th>رقم القرار</th>
                                <th>موجه إلى</th>
                                <th>موجه من</th>
                                <th>الوصف</th>
                                <th>تاريخ القرار</th>
                                <th>معلومات إضافية</th>
                                <th>الإجراءات</th>
                                <th>رابط التحميل</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentDecisions.map((decision) => (
                                <tr key={decision.id}>
                                    <td>{decision.decisionId}</td>
                                    <td>{decision.addressedTo}</td>
                                    <td>{decision.addressedFrom}</td>
                                    <td>{decision.description}</td>
                                    <td>{decision.dateOfDecision}</td>
                                    <td>{decision.additionalInformation}</td>
                                    <td>
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleEditDecision(decision.id)}
                                        >
                                            تعديل
                                        </button>
                                    </td>
                                    <td>
                                        {decision.url ? (
                                            <a href={decision.url} target="_blank" rel="noopener noreferrer"
                                               className="btn btn-success">
                                                تحميل
                                            </a>
                                        ) : (
                                            'غير متوفر'
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
                                السابق
                            </button>
                        </li>
                        {[...Array(Math.ceil(filteredDecisions.length / decisionsPerPage)).keys()].map(page => (
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
                                disabled={currentPage === Math.ceil(filteredDecisions.length / decisionsPerPage)}
                            >
                                التالي
                            </button>
                        </li>
                    </ul>
                </nav>
            </main>

            {/* Modal for adding/editing decisions */}
            {showModal && (
                <div className="modal show" style={{ display: 'block' }} role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditMode ? 'تعديل القرار' : 'إضافة قرار'}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleModalClose}
                                />
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="decisionId" className="form-label">رقم القرار</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="decisionId"
                                            name="decisionId"
                                            value={currentDecision.decisionId}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="addressedTo" className="form-label">موجه إلى</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="addressedTo"
                                            name="addressedTo"
                                            value={currentDecision.addressedTo}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="addressedFrom" className="form-label">موجه من</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="addressedFrom"
                                            name="addressedFrom"
                                            value={currentDecision.addressedFrom}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">الوصف</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            value={currentDecision.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="dateOfDecision" className="form-label">تاريخ القرار</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="dateOfDecision"
                                            name="dateOfDecision"
                                            value={currentDecision.dateOfDecision}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="additionalInformation" className="form-label">معلومات إضافية</label>
                                        <textarea
                                            className="form-control"
                                            id="additionalInformation"
                                            name="additionalInformation"
                                            value={currentDecision.additionalInformation}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="url" className="form-label">الرابط</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            id="url"
                                            name="url"
                                            value={currentDecision.url}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        {isEditMode ? 'تحديث القرار' : 'إضافة قرار'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DecisionsTable;

import React, { useState, useEffect } from 'react';
import { auth, db, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateDoc, doc, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../Settings.css';
import '../Dashboard.css'
import MinistryImage from "../Images/ministry-of-culture-republic-of-lebanon.jpg";

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        username: '',
        email: '',
        theme: 'light',
        notificationsEnabled: true,
        language: 'en',
        appVersion: '1.0.0',
        privacy: {
            showEmail: true,
            enableTwoFactor: false,
        },
        security: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        location: '',
        accountDeactivation: false,
        profilePic: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(true); // For toggling the sidebar visibility

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    setSettings({
                        ...settings,
                        username: user.displayName || '',
                        email: user.email || '',
                        theme: user.theme || 'light',
                        language: user.language || 'en',
                    });
                }
            } catch (err) {
                console.log('Error fetching data:', err);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSettings((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const handlePrivacyChange = (e) => {
        const { name, checked } = e.target;
        setSettings((prevState) => ({
            ...prevState,
            privacy: {
                ...prevState.privacy,
                [name]: checked,
            },
        }));
    };

    const handleSecurityChange = (e) => {
        const { name, value } = e.target;
        setSettings((prevState) => ({
            ...prevState,
            security: {
                ...prevState.security,
                [name]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = auth.currentUser;

            // Update username and email
            if (settings.username !== user.displayName) {
                await updateProfile(user, { displayName: settings.username });
            }

            if (settings.email !== user.email) {
                await updateEmail(user, settings.email);
            }

            // Update privacy settings in Firestore
            await updateDoc(doc(db, 'users', user.uid), {
                privacy: settings.privacy,
                theme: settings.theme,
                language: settings.language,
                location: settings.location,
            });

            // Handle password change if provided
            if (settings.newPassword && settings.newPassword === settings.confirmPassword) {
                const credentials = EmailAuthProvider.credential(user.email, settings.security.oldPassword);
                await reauthenticateWithCredential(user, credentials);
                await updatePassword(user, settings.security.newPassword);
            }

            // Update profile picture if a new one is provided
            if (settings.profilePic) {
                const fileRef = ref(storage, `profilePics/${user.uid}`);  // Correct reference for storage
                await uploadBytes(fileRef, settings.profilePic);  // Upload the profile picture to Firebase Storage
                const photoURL = await getDownloadURL(fileRef);  // Get the URL of the uploaded image
                await updateProfile(user, { photoURL });  // Update the user's profile with the new photo URL
            }

            // Deactivate account if selected
            if (settings.accountDeactivation) {
                await user.delete(); // WARNING: This will permanently delete the user account.
            }

            setLoading(false);
            alert('Settings updated successfully!');
        } catch (err) {
            setLoading(false);
            setError(err.message || 'An error occurred.');
            console.log('Error updating settings:', err);
        }
    };

    const handleToggle = () => {
        setSidebarVisible((prev) => !prev);
    };

    function handleLogout() {

    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
                <div className="sidebar-header">
                    <img src={MinistryImage} alt="Ministry Logo" className="sidebar-logo"/>
                    <h2 className="sidebar-title">Ministry of Culture</h2>
                    <button className="toggle-btn" onClick={handleToggle}><i className="fas fa-bars"></i></button>
                </div>
                <nav className="nav-links">
                    <ul>
                        <li><a href="/applications" className="nav-link"><i className="fas fa-table nav-icon"></i><span>Applications Table</span></a></li>
                        <li><a href="/profile" className="nav-link"><i className="fas fa-user nav-icon"></i><span>Profile</span></a></li>
                        <li><a href="/settings" className="nav-link"><i className="fas fa-cog nav-icon"></i><span>Settings</span></a></li>
                        <li>
                            <button className="nav-link logout" onClick={handleLogout}><i className="fas fa-sign-out-alt nav-icon"></i><span>Logout</span></button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Settings Content */}
            <div className="settings-page">
                <h2>Settings</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    {/* General Settings */}
                    <div className="settings-section">
                        <h3>General Settings</h3>
                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={settings.username}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={settings.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="theme">Theme</label>
                            <select
                                id="theme"
                                name="theme"
                                value={settings.theme}
                                onChange={handleInputChange}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="language">Language</label>
                            <select
                                id="language"
                                name="language"
                                value={settings.language}
                                onChange={handleInputChange}
                            >
                                <option value="en">English</option>
                                <option value="fr">French</option>
                                <option value="ar">Arabic</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="appVersion">App Version</label>
                            <input
                                type="text"
                                id="appVersion"
                                name="appVersion"
                                value={settings.appVersion}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="settings-section">
                        <h3>Notification Settings</h3>
                        <div>
                            <label htmlFor="notificationsEnabled">Enable Notifications</label>
                            <input
                                type="checkbox"
                                id="notificationsEnabled"
                                name="notificationsEnabled"
                                checked={settings.notificationsEnabled}
                                onChange={handleCheckboxChange}
                            />
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="settings-section">
                        <h3>Privacy Settings</h3>
                        <div>
                            <label htmlFor="showEmail">Show Email</label>
                            <input
                                type="checkbox"
                                id="showEmail"
                                name="showEmail"
                                checked={settings.privacy.showEmail}
                                onChange={handlePrivacyChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="enableTwoFactor">Enable Two Factor Authentication</label>
                            <input
                                type="checkbox"
                                id="enableTwoFactor"
                                name="enableTwoFactor"
                                checked={settings.privacy.enableTwoFactor}
                                onChange={handlePrivacyChange}
                            />
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="settings-section">
                        <h3>Security Settings</h3>
                        <div>
                            <label htmlFor="oldPassword">Old Password</label>
                            <input
                                type="password"
                                id="oldPassword"
                                name="oldPassword"
                                value={settings.security.oldPassword}
                                onChange={handleSecurityChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={settings.security.newPassword}
                                onChange={handleSecurityChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={settings.security.confirmPassword}
                                onChange={handleSecurityChange}
                            />
                        </div>
                    </div>

                    {/* Location Settings */}
                    <div className="settings-section">
                        <h3>Location Settings</h3>
                        <div>
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={settings.location}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Profile Picture */}
                    <div className="settings-section">
                        <h3>Profile Picture</h3>
                        <div>
                            <label htmlFor="profilePic">Upload Profile Picture</label>
                            <input
                                type="file"
                                id="profilePic"
                                name="profilePic"
                                onChange={(e) => setSettings({...settings, profilePic: e.target.files[0]})}
                            />
                        </div>
                    </div>

                    {/* Account Deactivation */}
                    <div className="settings-section">
                        <h3>Account Deactivation</h3>
                        <div>
                            <label htmlFor="accountDeactivation">Deactivate Account</label>
                            <input
                                type="checkbox"
                                id="accountDeactivation"
                                name="accountDeactivation"
                                checked={settings.accountDeactivation}
                                onChange={handleCheckboxChange}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;

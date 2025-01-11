import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from '../firebase'; // Import Firebase auth and signInWithEmailAndPassword
import '../LoginPage.css';
import './DashboardPage'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email && password) {
            try {
                // Use signInWithEmailAndPassword method from Firebase
                await signInWithEmailAndPassword(auth, email, password); // Firebase login

                // Redirect to the dashboard if login is successful
                navigate('/dashboard');
            } catch (error) {
                setError('Invalid email or password');
            }
        } else {
            setError('Please enter both email and password');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <img src="../Images/ministry-of-culture-republic-of-lebanon.jpg" alt="Ministry Logo" className="login-logo" />
                <h2 className="login-title">Ministry of Culture - Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-wrapper">
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="submit-button">Login</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <a href="/forgot-password" className="forgot-password">Forgot password?</a>
                <div className="register-link">Don't have an account? <a href="/register">Register</a></div>
            </div>
        </div>
    );
};

export default LoginPage;

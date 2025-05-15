import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import './index.css';

const Signup = () => {
    const navigate = useNavigate();
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputErrors, setInputErrors] = useState({
        name: false,
        email: false,
        password: false
    });

    const onChangeInputVal = (e) => {
        const { name, value } = e.target;
        setSignupInfo(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (inputErrors[name]) {
            setInputErrors(prev => ({
                ...prev,
                [name]: false
            }));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateInputs = () => {
        const errors = {
            name: !signupInfo.name,
            email: !signupInfo.email || !/^\S+@\S+\.\S+$/.test(signupInfo.email),
            password: !signupInfo.password || signupInfo.password.length < 6
        };
        setInputErrors(errors);
        return !Object.values(errors).some(Boolean);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!validateInputs()) {
            handleError('Please fill all fields correctly (password must be at least 6 characters)');
            return;
        }

        setIsLoading(true);
        
        try {
            const url = "https://shopeasy-backend-0wjl.onrender.com/auth/signup";
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            
            const results = await response.json();
            const { message, success, error } = results;
            
            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else if (error) {
                const errMsg = error?.details[0]?.message || 'Registration failed';
                handleError(errMsg);
            } else if (!success) {
                handleError(message || 'Registration failed');
            }
        } catch (err) {
            handleError(err.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='user-signup-container'>
            <div className='user-signup-form-container'>
                <h1 className='user-signup-title'>Create Account</h1>
                <form className='user-signup-form' onSubmit={handleSignup}>
                    <div className='user-signup-input-group'>
                        <label className='user-signup-label' htmlFor='name'>Full Name</label>
                        <input
                            className={`user-signup-input ${inputErrors.name ? 'user-signup-input-error' : ''}`}
                            onChange={onChangeInputVal}
                            type='text'
                            name='name'
                            autoFocus
                            placeholder='Enter your full name'
                            value={signupInfo.name}
                        />
                    </div>
                    <div className='user-signup-input-group'>
                        <label className='user-signup-label' htmlFor='email'>Email</label>
                        <input 
                            className={`user-signup-input ${inputErrors.email ? 'user-signup-input-error' : ''}`}
                            onChange={onChangeInputVal}
                            type='email'
                            name='email'
                            placeholder='Enter your email'
                            value={signupInfo.email}
                        />
                    </div>
                    <div className='user-signup-input-group'>
                        <label className='user-signup-label' htmlFor='password'>Password</label>
                        <input
                            className={`user-signup-input ${inputErrors.password ? 'user-signup-input-error' : ''}`}
                            onChange={onChangeInputVal}
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            placeholder='Create a password (min 6 characters)'
                            value={signupInfo.password}
                        />
                        <div className='user-signup-show-password'>
                            <input
                                type='checkbox'
                                id='showPassword'
                                checked={showPassword}
                                onChange={togglePasswordVisibility}
                                className='user-signup-show-password-checkbox'
                            />
                            <label htmlFor='showPassword' className='user-signup-show-password-label'>
                                Show Password
                            </label>
                        </div>
                    </div>
                    <button 
                        type='submit'
                        className={`user-signup-button ${isLoading ? 'user-signup-button-loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                    <p className='user-signup-login-text'>
                        Already have an account?
                        <span className='user-signup-login-link'>
                            <Link to="/login"> Log In</Link>
                        </span>
                    </p>
                </form>
                <ToastContainer 
                    position="top-center"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    className='user-signup-toast'
                />
            </div>
        </div>
    );
};

export default Signup;
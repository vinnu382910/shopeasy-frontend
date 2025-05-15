import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import './index.css';

const Login = () => {
    const navigate = useNavigate();
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputErrors, setInputErrors] = useState({
        email: false,
        password: false
    });

    const onChangeInputVal = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({
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
            email: !loginInfo.email,
            password: !loginInfo.password
        };
        setInputErrors(errors);
        return !Object.values(errors).some(Boolean);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateInputs()) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        
        try {
            const url = "https://shopeasy-backend-0wjl.onrender.com/auth/login";
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            
            const results = await response.json();
            const { message, success, jwtToken, name, error } = results;
            
            if (success) {
                toast.success(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else if (error) {
                const errMsg = error?.details[0]?.message || 'Invalid credentials';
                toast.error(errMsg);
            } else if (!success) {
                toast.error(message || 'Login failed');
            }
        } catch (err) {
            toast.error(err.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='user-login-container'>
            <div className='user-login-form-container'>
                <h1 className='user-login-title'>User Login</h1>
                <form className='user-login-form' onSubmit={handleLogin}>
                    <div className='user-login-input-group'>
                        <label className='user-login-label' htmlFor='email'>Email</label>
                        <input 
                            className={`user-login-input ${inputErrors.email ? 'user-login-input-error' : ''}`}
                            onChange={onChangeInputVal}
                            type='email'
                            name='email'
                            placeholder='Enter your email...'
                            value={loginInfo.email}
                        />
                    </div>
                    <div className='user-login-input-group'>
                        <label className='user-login-label' htmlFor='password'>Password</label>
                        <input
                            className={`user-login-input ${inputErrors.password ? 'user-login-input-error' : ''}`}
                            onChange={onChangeInputVal}
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            placeholder='Enter your password...'
                            value={loginInfo.password}
                        />
                        <div className='user-login-show-password'>
                            <input
                                type='checkbox'
                                id='showPassword'
                                checked={showPassword}
                                onChange={togglePasswordVisibility}
                                className='user-login-show-password-checkbox'
                            />
                            <label htmlFor='showPassword' className='user-login-show-password-label'>
                                Show Password
                            </label>
                        </div>
                    </div>
                    <button 
                        type='submit'
                        className={`user-login-button ${isLoading ? 'user-login-button-loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    <p className='user-login-signup-text'>
                        Don't have an account?
                        <span className='user-login-signup-link'>
                            <Link to="/signup">Sign up</Link>
                        </span>
                    </p>
                </form>
                <ToastContainer className='user-login-toast'/>
            </div>
        </div>
    );
};

export default Login;
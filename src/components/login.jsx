import React, { useState, useEffect } from "react";
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './login.css';
import LogoSvg from "./logosvg";

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [user, setUser] = useState();
    const [profile, setProfile] = useState([]);


    // For UI Transitions
    const handleSignUpClick = () => {
        setIsSignUpActive(true);
    };

    const handleSignInClick = () => {
        setIsSignUpActive(false);
    };



    // For GOOGLE LOGIN
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error),
        scope: "email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/drive",
    });


    // Whenever user variable changes, navigate to dashboard and pass user credentials
    useEffect(
        () => {
            if (user) {
                console.log(user);
                navigate('/dashboard', { state: { user } });
            }
        }, [user]);


    return (
        <div className="login-page">
            <div class="stars"></div>
            <div class="stars1"></div>
            <div class="stars2"></div>
            <div className={`container ${isSignUpActive ? 'right-panel-active' : ''}`}>
                <div className="form-container sign-up-container">
                    <form action="#">
                        <h1>Sign Up with Google</h1>
                        <br></br><br></br><br></br>
                        <div className="login-button">
                            <button onClick={login}>Sign in with Google 🚀</button>
                        </div>
                    </form>
                </div>
                <div className="form-container sign-in-container">
                    <form action="#">
                        <LogoSvg />
                        <p>Start your studying journey with us.</p>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Focus Flow!</h1>
                            <p>Focus flow is a website where you can organize all your study materials for efficient memorization.</p>
                            <button className="ghost" onClick={handleSignInClick}>Go Back</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Click here to start the journey with us</p>
                            <button className="ghost" onClick={handleSignUpClick}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;

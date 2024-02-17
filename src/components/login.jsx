import React, { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

import './login.css';
import LogoSvg from "./logosvg";

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSignUpActive, setIsSignUpActive] = useState(false);

    const handleSignUpClick = () => {
        setIsSignUpActive(true);
    };

    const handleSignInClick = () => {
        setIsSignUpActive(false);
    };


    return (
        <div className="login-page">
            <div className={`container ${isSignUpActive ? 'right-panel-active' : ''}`}>
                <div className="form-container sign-up-container">
                    <form action="#">
                        <h1>Sign Up with Google</h1>
                        <br></br><br></br><br></br>
                        <div className="login-button">
                        <GoogleLogin
                            onSuccess={tokenResponse => {
                                console.log(tokenResponse);
                                const token = tokenResponse?.credential;
                                
                                if(token) {
                                    navigate('/dashboard',{state: { token: token }});
                                }
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                        />
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

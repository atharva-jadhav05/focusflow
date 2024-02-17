import React from "react";
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
    const location = useLocation();
    const { state } = location;
    const access_token = state?.tokenResponse?.credential || null;

    return (
        <>
        <h2>Getting access token here</h2>
            
        </>
    )
}

export default Dashboard;

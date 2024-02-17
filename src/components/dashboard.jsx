import React from "react";
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
    const location = useLocation();
    const { state } = location;
    const access_token = location.credential;

    return (
        <>
        {console.log(access_token)}
        <h1>Hello {access_token}</h1>
            
        </>
    )
}

export default Dashboard;

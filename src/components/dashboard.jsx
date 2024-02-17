import React from "react";
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
    const location = useLocation();
    const { state } = location;

    return (
        <>
        <h1>{state.tokenResponse}</h1>
        </>
    )
}

export default Dashboard;

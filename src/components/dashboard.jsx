import React from "react";
import { useLocation } from 'react-router-dom';

const Dashboard = ({location}) => {
    const location = useLocation();
    const token = location && location.state ? location.state : null;

    return (
        <>
        <h1>{location}</h1>
        </>
    )
}

export default Dashboard;

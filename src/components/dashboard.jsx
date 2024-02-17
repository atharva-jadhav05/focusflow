import React from "react";

const Dashboard = ({location}) => {
    const token = location && location.state ? location.state : null;

    return (
        <>
        <h1>{location}</h1>
        </>
    )
}

export default Dashboard;

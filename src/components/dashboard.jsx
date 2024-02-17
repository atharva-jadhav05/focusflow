import React from "react";

const Dashboard = ({location}) => {
    const token = location && location.state ? location.state.token : null;

    return (
        <>
        <h1>{token}</h1>
        </>
    )
}

export default Dashboard;

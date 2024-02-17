import React from "react";

const Dashboard = (props) => {
    const { location } = props;
    const token = location.state?.token;

    return (
        <>
        <h1>{token}</h1>
        </>
    )
}

export default Dashboard;

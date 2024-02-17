import React from "react";
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
    const location = useLocation();
    const { state } = location;
    const access_token = state.tokenResponse.credential ? state.tokenResponse.credential : null;

    return (
        <>{console.log(state)}
        {console.log(state.tokenResponse.credential)}
        <h1>Hello {access_token}</h1>
            
        </>
    )
}

export default Dashboard;

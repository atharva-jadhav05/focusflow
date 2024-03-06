import React from "react";
import { useLocation } from 'react-router-dom';


const Workspace = () => {
    const location = useLocation();
    const { state } = location;

    const folderName = state?.name || null;
    const folderId = state?.id || null;
    const accessToken = state?.accessToken || null; 


    return (
        <>
        <h1>Hi! Welcome to Workspace </h1>
        <h2>Folder name {folderName}</h2>
        {console.log(folderId, ' ', accessToken)}
        </>
    )
}

export default Workspace;
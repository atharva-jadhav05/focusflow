import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';


const Workspace = () => {
    const location = useLocation();
    const { state } = location;

    const folderName = state?.name || null;
    const folderId = state?.id || null;
    const accessToken = state?.accessToken || null; 

    const [files, setFiles] = useState([]);

    useEffect(() => {
        const apiUrl = 'https://www.googleapis.com/drive/v3/files';

        const response = axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                q: `'${folderId}' in parents and mimeType='application/pdf'`,
            },
        });

        const pdf_files = response.data.files;
        setFiles(pdf_files)
        console.log(pdf_files);

    });



    return (
        <>
        <h1>Hi! Welcome to Workspace </h1>
        <h2>Folder name {folderName}</h2>
        {console.log(folderId, ' ', accessToken)}
        </>
    )
}

export default Workspace;
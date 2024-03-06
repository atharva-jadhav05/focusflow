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

    const getFilesFromDrive = async () => {
        const apiUrl = 'https://www.googleapis.com/drive/v3/files';

        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                q: `'${folderId}' in parents and mimeType='application/pdf'`,
            },
        });

        const pdf_files = response.data;
        // setFiles(pdf_files)
        console.log(response);

    }

    useEffect(() => {
        getFilesFromDrive();
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
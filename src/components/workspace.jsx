import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

import './workspace.css';
import LogoSvg from "./logosvg";


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

        const pdf_files = response.data.files;
        setFiles(pdf_files)
        console.log(response);

    }



    useEffect(() => {
        getFilesFromDrive();
    });




    return (
        <>
            {/* <!-- Navbar --> */}
            <div class="navbar">
                <div class="logo">
                    <LogoSvg/>
                </div>
                <ul class="menu">
                    <li><a href="#">Home</a></li>
                    <li class="dropdown">
                        <a href="#">Bookmarks &#9662;</a>
                        <div class="dropdown-content">
                            <input type="text" placeholder="Type bookmark name"></input>
                                <button id="addBookmarkBtn">Add</button>
                                <div id="bookmarksList"></div>
                        </div>
                    </li>
                    <li><a href="#">Highlighter</a></li>
                    <li><a href="#" id="importButton">Import</a></li>
                </ul>
            </div>

            {console.log(folderId, ' ', accessToken, ' ', folderName)}
        </>
    )
}

export default Workspace;
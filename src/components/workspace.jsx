import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

import './workspace.css';
import LogoSvg from "./logosvg";


const Workspace = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const folderName = state?.name || null;
    const folderId = state?.id || null;
    const accessToken = state?.accessToken || null;

    const [files, setFiles] = useState([]);
    const iframeRef = useRef();


    const [bookmarks, setBookmarks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

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

    const displayPDF = (file) => {

        const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        const headers = {
            Authorization: `Bearer ${accessToken}`,
        };
        axios.get(url, { headers, responseType: 'blob' })
            .then(response => {
                const pdfBlob = new Blob([response.data], {type: 'application/pdf'});
                const pdfUrl = URL.createObjectURL(pdfBlob);
                
                iframeRef.current.src = pdfUrl;
                
            })
            .catch(error => {
                console.error('Error fetching PDF:', error);
            });
    }

    const addBookmark = () => {
        setBookmarks([...bookmarks, currentPage]);
        console.log(currentPage);
        console.log(iframeRef);
      };


    useEffect(() => {
        getFilesFromDrive();
    }, []);



    return (
        <>
        <div className="workspace">
            {/* <!-- Navbar --> */}
            <div class="navbar">
                <div class="logo">
                    <LogoSvg />
                </div>
                <ul class="menu">
                    <li><a href="#" onClick={() => navigate(-1)}>Home</a></li>
                    <li class="dropdown">
                        <a href="#" onClick={() => addBookmark()}>Bookmark current page &#9662;</a>
                        {/* <div class="dropdown-content">
                            <input type="text" placeholder="Type bookmark name"></input>
                            <button id="addBookmarkBtn">Add</button>
                            <div id="bookmarksList"></div>
                        </div> */}
                    </li>
                    <li><a href="#">Highlighter</a></li>
                    <li><a href="#" id="importButton">Import</a></li>
                </ul>
            </div>

            {/* <!-- Main content --> */}
            <div class="container">
                {/* <!-- Left section for playlist --> */}
                <div class="playlist">
                    <div class="pdf-button-container" id="pdfList">
                        {/* <!-- PDF buttons will be dynamically added here --> */}
                        {files.map((file) => (
                            <button
                                key={file.id}
                                className="pdf-button"
                                onClick={() => displayPDF(file)}
                            >
                                {file.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* <!-- Middle section for PDF viewer --> */}
                <div class="pdf-viewer">
                    <iframe 
                        ref={iframeRef} 
                        id="pdfFrame" 
                        title="PDF Viewer" 
                        width="100%" 
                        height="600" 
                        frameborder="0"
                        ></iframe>
                </div>
                {/* <!-- Right section for checklist --> */}
                <div class="checklist">
                    <h3 style={{color:"white"}}>Bookmarks</h3>
                    {/* <!-- PDF buttons for checklist will be dynamically added here --> */}

                </div>
            </div>



            {console.log(folderId, ' ', accessToken, ' ', folderName)}
            </div>
        </>
    )
}

export default Workspace;
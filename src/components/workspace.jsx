import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

import './workspace.css';
import LogoSvg from "./logosvg";


const Workspace = () => {
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const folderName = state?.name || null;
    const folderId = state?.id || null;
    const accessToken = state?.accessToken || null;

    const [files, setFiles] = useState([]);
    const iframeRef = useRef();
    const bookmark_name = useRef();
    const bookmark_page = useRef();
    const [currentFileId, setCurrentFileId] = useState();

    const [bookmarkFileId, setBookmarkFileId] = useState();
    const [bookmarks, setBookmarks] = useState([]);
    const [toShowBookmarks, setToShowBookmarks] = useState([]);

    const [fileList, setFileList] = useState([]);
    const fileInputRef = useRef();


    // Load and create links for all files in folder
    const getFilesFromDrive = async () => {
        const apiUrl = 'https://www.googleapis.com/drive/v3/files';
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    q: `'${folderId}' in parents and mimeType='application/pdf'`,
                },
            });

            const filesWithBlobLinks = await Promise.all(
                response.data.files.map(async file => {
                    try {
                        const pdfBlobResponse = await axios.get(
                            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                },
                                responseType: 'blob',
                            }
                        );
                        const pdfBlob = new Blob([pdfBlobResponse.data], { type: 'application/pdf' });
                        const blobUrl = URL.createObjectURL(pdfBlob);

                        return {
                            ...file,
                            blob_link: blobUrl,
                        };
                    } catch (error) {
                        console.error(`Error fetching PDF for file ${file.id}:`, error);
                        return null; // Return null for failed files
                    }
                })
            );
            const validFilesWithBlobLinks = filesWithBlobLinks.filter(file => file !== null);

            setFiles(validFilesWithBlobLinks);
            console.log(validFilesWithBlobLinks);

        } catch (error) {
            console.error('Error fetching PDF files:', error);
        } finally {
            setLoading(false); // Turn off loading indicator regardless of success or failure
        }

    }

    // Display PDF using blob link
    const displayPDF = (file) => {
        const pdfUrl = file.blob_link;

        if (pdfUrl) {
            iframeRef.current.src = pdfUrl;
            setCurrentFileId(file.id);
        } else {
            console.error('Blob link not found for file:', file);
        }
    }


    // Create Bookmarks File
    const createBookmarksFile = async () => {
        const url = "https://focusflow-server.onrender.com/create_bookmarks_json";
        try {
            const response = await axios.get(url, {
                params: {
                    access_token: accessToken,
                    folder_id: folderId
                }
            });

            setBookmarks(response.data.bookmarks_data);
            setBookmarkFileId(response.data.file_id);
            console.log(response);

        } catch (error) {
            console.error('Error creating JSON bookmarks:', error);
            return null;
        }
    };


    const addBookmark = async () => {

        const data = { fileId: currentFileId, name: bookmark_name.current.value, page: parseInt(bookmark_page.current.value) };
        setBookmarks([...bookmarks, data ]);
        setToShowBookmarks([...toShowBookmarks, data]);

        console.log(bookmarkFileId);


        const url = "https://focusflow-server.onrender.com/add_bookmark";
        const params = {
            access_token: accessToken,
            file_id: bookmarkFileId
        };

        try {
            const response = await axios.post(url, data, {
                params: params
            });
            console.log(response.data);
        } catch (error) {
            console.error('Error adding bookmark:', error);
        }

        bookmark_name.current.value = '';
        bookmark_page.current.value = '';

    };

    const saveBookmarksToDrive = async () => {
        const bookmarksData = JSON.stringify(bookmarks);
        const fileName = 'bookmarks.json';

        // Check if the bookmarks file exists in the specified folder
        const listFilesUrl = 'https://www.googleapis.com/drive/v3/files';
        const listFilesResponse = await axios.get(listFilesUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
            },
        });

        const files = listFilesResponse.data.files;

        try {

            // Get the existing or newly created file ID
            const fileId = files.length > 0 ? files[0].id : await createBookmarksFile(fileName);

            // Upload the updated bookmarks data to the file
            const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}`;
            await axios.patch(uploadUrl, bookmarksData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    uploadType: 'media',
                },
            });

            console.log('Bookmarks updated and saved to Drive. File ID:', fileId);
        } catch (error) {
            console.error('Error saving bookmarks to Drive:', error);
        }
    };



    const handleBookmarkClick = (bookmark) => {
        const file = files.find(file => file.id === bookmark.fileId);
        iframeRef.current.src = `${file.blob_link}#page=${bookmark.page}`;

        console.log(iframeRef.current.src);
    }


    useEffect(() => {
        getFilesFromDrive();
        createBookmarksFile();
    }, []);



    // const handleFileUpload = async (files) => {
    //     const drive = google.drive({
    //         version: 'v3',
    //         auth: accessToken, // Replace with the user's access token
    //       });
    // //     try {
    // //         console.log(files);

    // // const uploadPromises = [];

    // for (let i = 0; i < files.length; i++) {
    //     try {
    //         const pdfFile = fileList[i];
    //         const fileStream = pdfFile.stream; // File stream
    //         const fileSize = fileStream.size; // File size

    //         // Upload PDF file
    //         const res = await drive.files.create({
    //           requestBody: {
    //             name: pdfFile.name,
    //             mimeType: 'application/pdf',
    //             parents: [folderId], // Replace with the folder ID where you want to upload
    //           },
    //           media: {
    //             mimeType: 'application/pdf',
    //             body: fileStream, // File stream
    //           },
    //         }, {
    //           // Use resumable upload for large files
    //           requestBody: {
    //             name: pdfFile.name,
    //             mimeType: 'application/pdf',
    //             parents: [folderId], // Replace with the folder ID where you want to upload
    //           },
    //           media: {
    //             mimeType: 'application/pdf',
    //             body: fileStream, // File stream
    //           },
    //         });

    //         console.log('File uploaded:', res.data);
    //       } catch (error) {
    //         console.error('Error uploading file:', error);
    //       }
    // //   const file = fileList[i];

    // //   const formData = new FormData();
    // //   formData.append('file', file);

    // //   const response = await axios.post(
    // //     `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&parents=${folderId}`,
    // //     formData,
    // //     {
    // //       headers: {
    // //         'Content-Type': 'application/pdf',
    // //         Authorization: `Bearer ${accessToken}`,
    // //       },
    // //     }
    // //   );

    // //   console.log('File uploaded:', response.data.name);
    // //   uploadPromises.push(response);
    // // }

    // // await Promise.all(uploadPromises);
    // //       setFileList([]);
    // //     } catch (error) {
    // //       console.error('Error uploading files to Drive:', error);
    //     }
    //   };


    const handleFileSelect = async (files) => {
        console.log(files);
        await setFileList(files);
        // handleFileUpload(files);
    };

    const handleButtonClick = () => {
        // Programmatically trigger the file input click event
        fileInputRef.current.click();
    };


    return (
        <>
            {loading ? (
                <div className="loader-container">
                    <div className="loader"></div>
                    <div class="loading-text">&#9;&#9;Loading files from drive...</div>
                </div> // Render loading indicator while fetching files
            ) : (
                <div className="workspace">
                    {/* <!-- Navbar --> */}
                    <div class="navbar">
                        <div class="logo">
                            <LogoSvg />
                        </div>
                        <ul class="menu">
                            <li><a href="#" onClick={() => navigate(-1)}>Home</a></li>

                            <li class="dropdown">
                                <a href="#">Bookmark page &#9662;</a>
                                <div class="dropdown-content">
                                    <input ref={bookmark_name} type="text" placeholder="Type bookmark name"></input>
                                    <input ref={bookmark_page} type="number" placeholder="Type Page number"></input>

                                    <button id="addBookmarkBtn" onClick={addBookmark}>Add</button>
                                    <div id="bookmarksList"></div>
                                </div>
                            </li>
                            <li><a href="#">Highlighter</a></li>

                            <li><a href="#" id="importButton" onClick={handleButtonClick}>Upload</a>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    multiple
                                    id="fileInput"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }} // Hide the input element
                                /></li>
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
                            <h3 style={{ color: "white" }}>Bookmarks</h3>
                            {/* <!-- PDF buttons for checklist will be dynamically added here --> */}
                            {toShowBookmarks.map((bookmark, index) => (
                                <button key={index} onClick={() => handleBookmarkClick(bookmark)} style={{ display: 'block', width: '100%', backgroundColor: 'rgb(126 126 158)', color: '#FFFBEB', height: '5vh' }}>
                                    {bookmark.name} - Page {bookmark.page}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>)}
        </>
    )
}

export default Workspace;
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

    const [activeButton, setActiveButton] = useState(null);


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

    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedBookmark, setSelectedBookmark] = useState(null);
    const [isBContextMenuVisible, setBContextMenuVisible] = useState(false);
    const [isBConfirmationPopupVisible, setBConfirmationPopupVisible] = useState(false);

    const [selectedPDF, setSelectedPDF] = useState(null);
    const [isPDFContextMenuVisible, setPDFContextMenuVisible] = useState(false);
    const [isPDFConfirmationPopupVisible, setPDFConfirmationPopupVisible] = useState(false);

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
            setActiveButton(file.id);
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
            setToShowBookmarks(response.data.bookmarks_data);
            setBookmarkFileId(response.data.file_id);
            console.log(response);

        } catch (error) {
            console.error('Error creating JSON bookmarks:', error);
            return null;
        }
    };

    // Add bookmark to file
    const addBookmark = async () => {

        const data = { fileId: currentFileId, name: bookmark_name.current.value, page: parseInt(bookmark_page.current.value) };
        setBookmarks([...bookmarks, data]);
        setToShowBookmarks([...toShowBookmarks, data]);

        console.log(bookmarkFileId);


        const url = "https://focusflow-server.onrender.com/add_bookmark";
        const params = {
            'access_token': accessToken,
            'file_id': bookmarkFileId
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



    const handleBookmarkClick = (bookmark) => {
        const file = files.find(file => file.id === bookmark.fileId);
        iframeRef.current.src = `${file.blob_link}#page=${bookmark.page}`;
        setCurrentFileId(file.id);
        setActiveButton(file.id);

        console.log(iframeRef.current.src);
    }

    const fileToBytes = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const arrayBuffer = reader.result;
                const bytes = new Uint8Array(arrayBuffer);
                resolve(bytes);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    };

    const handleFileUpload = async (files) => {
        const url = "https://focusflow-server.onrender.com/upload_pdf_to_drive";

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const bytes = await fileToBytes(file);
                console.log('File converted to bytes:', bytes);

                const access_token = accessToken;
                const folder_id = folderId;

                console.log(access_token);
                console.log(folder_id);

                const newURL = `${url}?access_token=${accessToken}&folder_id=${folderId}&file_name=${file.name}`;

                const response = await axios.post(newURL, bytes, {
                    headers: {
                        'Content-Type': 'application/octet-stream'
                    }
                });

                console.log('Response from server:', response.data);
            } catch (error) {
                console.error('Error uploading PDF to drive:', error);
            }
        }

        window.location.reload();

    }



    useEffect(() => {
        getFilesFromDrive();
        createBookmarksFile();
    }, []);



    const handleFileSelect = async (files) => {
        console.log(files);
        await setFileList(files);
        handleFileUpload(files);
    };

    const handleButtonClick = () => {
        // Programmatically trigger the file input click event
        fileInputRef.current.click();
    };


    const handleBookmarkRightClick = (event, bookmark) => {
        event.preventDefault();
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
        setSelectedBookmark(bookmark);
        setBContextMenuVisible(true);
    }

    const hideBContextMenu = () => {
        setBContextMenuVisible(false);
    };

    const showBConfirmationPopup = () => {
        setBConfirmationPopupVisible(true);
        hideBContextMenu();
    };

    const hideBConfirmationPopup = () => {
        setBConfirmationPopupVisible(false);
        setSelectedBookmark(null);
    };

    const confirmDeleteBookmark = () => {
        deleteBookmark(selectedBookmark);
        hideBContextMenu();
    }

    const deleteBookmark = async (bookmark) => {
        console.log('Deleting bookmark ', bookmark.name);

        const data = [{ fileId: bookmark.fileId, name: bookmark.name, page: bookmark.page }];
        console.log(bookmarkFileId);

        const url = "https://focusflow-server.onrender.com/delete_bookmarks";
        const params = {
            'access_token': accessToken,
            'file_id': bookmarkFileId
        };

        try {
            const response = await axios.post(url, data, {
                params: params
            });
            console.log(response.data);
            setBookmarks(response.data.remaining_bookmarks);
            setToShowBookmarks(response.data.remaining_bookmarks);
            hideBContextMenu();
            hideBConfirmationPopup();

        } catch (error) {
            console.error('Error deleting bookmark:', error);
        }


    }

    const handlePDFRightClick = (event, file) => {
        event.preventDefault();
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
        setSelectedPDF(file);
        setPDFContextMenuVisible(true);
    }

    const hidePDFContextMenu = () => {
        setPDFContextMenuVisible(false);
    }

    const showPDFConfirmationPopup = () => {
        setPDFConfirmationPopupVisible(true);
        hidePDFContextMenu();
    }

    const hidePDFConfirmationPopup = () => {
        setPDFConfirmationPopupVisible(false);
        setSelectedPDF(null);
    }

    const confirmDeletePDF = () => {
        deletePDF(selectedPDF);
        hidePDFContextMenu();
    }

    const deletePDF = async (file) => {
        try {

            const data = bookmarks.filter(bookmark => bookmark.fileId === file.id);

            const url = "https://focusflow-server.onrender.com/delete_bookmarks";
            const params = {
                'access_token': accessToken,
                'file_id': bookmarkFileId
            };

            try {
                const response = await axios.post(url, data, {
                    params: params
                });
                console.log(response.data);
                setBookmarks(response.data.remaining_bookmarks);
                setToShowBookmarks(response.data.remaining_bookmarks);

            } catch (error) {
                console.error('Error deleting bookmarks:', error);
            }


            const apiUrl = `https://www.googleapis.com/drive/v3/files/${file.id}`;

            await axios.delete(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            window.location.reload();
            console.log('Successfully deleted ', file.name);

        } catch (error) {
            console.error('Error deleting file:', error);
            // Handle the error as needed
        }

    }




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

                            <li><a id="importButton" onClick={handleButtonClick}>Upload</a>
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
                                        className={`pdf-button ${activeButton === file.id ? 'active' : ''}`}
                                        onClick={() => displayPDF(file)}
                                        onContextMenu={(event) => handlePDFRightClick(event, file)}
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
                                <button
                                    key={index}
                                    onClick={() => handleBookmarkClick(bookmark)}
                                    onContextMenu={(event) => handleBookmarkRightClick(event, bookmark)}
                                    style={{ display: 'block', margin: 'auto', width: '95%', backgroundColor: 'rgb(54 54 81)', color: 'rgb(255, 251, 235)', height: 'max-content', borderRadius: '25px', minHeight: '5vh' }}>
                                    {bookmark.name} - Page {bookmark.page}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isBConfirmationPopupVisible && (
                        <div className="confirmation-popup">
                            <label>Are you sure you want to delete this bookmark?</label>
                            <div className="confirmation-popup-buttons">
                                <button className="confirm" onClick={confirmDeleteBookmark}>
                                    Confirm
                                </button>
                                <button className="cancel" onClick={hideBConfirmationPopup}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {isBContextMenuVisible && (
                        <div
                            className="context-menu"
                            style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
                        >
                            <div className="context-menu-item delete" onClick={showBConfirmationPopup}>
                                Delete
                            </div>
                            <div className="context-menu-item cancel" onClick={hideBContextMenu}>
                                Cancel
                            </div>
                        </div>
                    )}


                    {isPDFConfirmationPopupVisible && (
                        <div className="confirmation-popup">
                            <label>Are you sure you want to delete this PDF File?</label>
                            <div className="confirmation-popup-buttons">
                                <button className="confirm" onClick={confirmDeletePDF}>
                                    Confirm
                                </button>
                                <button className="cancel" onClick={hidePDFConfirmationPopup}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {isPDFContextMenuVisible && (
                        <div
                            className="context-menu"
                            style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
                        >
                            <div className="context-menu-item delete" onClick={showPDFConfirmationPopup}>
                                Delete
                            </div>
                            <div className="context-menu-item cancel" onClick={hidePDFContextMenu}>
                                Cancel
                            </div>
                        </div>
                    )}



                </div>)}
        </>
    )
}

export default Workspace;
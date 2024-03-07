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
    const bookmark_name = useRef();
    const bookmark_page = useRef();
    const [currentFileId, setCurrentFileId] = useState();


    const [bookmarks, setBookmarks] = useState([]);
    const [toShowBookmarks, setToShowBookmarks] = useState([]);

    const [fileList, setFileList] = useState([]);


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

        // setToShowBookmarks([]);

        const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        const headers = {
            Authorization: `Bearer ${accessToken}`,
        };
        axios.get(url, { headers, responseType: 'blob' })
            .then(response => {
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(pdfBlob);

                iframeRef.current.src = pdfUrl;
                setCurrentFileId(file.id);

                // fetchBookmarks(file.id);

            })
            .catch(error => {
                console.error('Error fetching PDF:', error);
            });
    }

    const fetchBookmarks = async (fileId) => {
        const fileName = 'bookmarks.json';

        try {
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

            if (files.length > 0) {
                // File exists, fetch and display bookmarks
                const file_Id = files[0].id;
                const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file_Id}/export?mimeType=application/json`;
                const downloadResponse = await axios.get(downloadUrl, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const bookmarksData = downloadResponse.data || {};
                const currentFileBookmarks = bookmarksData.filter(bookmark => bookmark.fileId === fileId);

                setToShowBookmarks(currentFileBookmarks);
                console.log('Bookmarks loaded from Drive:', currentFileBookmarks);
            } else {
                // File doesn't exist, clear bookmarks
                setBookmarks([]);
                console.log('No bookmarks found for this PDF.');
            }
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        }
    };

    const addBookmark = () => {
        setBookmarks([...bookmarks, { fileId: currentFileId, name: bookmark_name.current.value, page: bookmark_page.current.value }]);
        setToShowBookmarks([...toShowBookmarks, { fileId: currentFileId, name: bookmark_name.current.value, page: bookmark_page.current.value }]);
        console.log(currentFileId, bookmark_name.current.value, bookmark_page.current.value);
        bookmark_name.current.value = '';
        bookmark_page.current.value = '';

        saveBookmarksToDrive();
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

    const createBookmarksFile = async (fileName) => {
        // Create the bookmarks file in the specified folder
        const createFileUrl = 'https://www.googleapis.com/upload/drive/v3/files';
        const createFileResponse = await axios.post(createFileUrl, {
            name: fileName,
            mimeType: 'application/json',
            parents: [folderId],
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            params: {
                uploadType: 'multipart',
            },
        });

        const fileId = createFileResponse.data.id;
        console.log('Bookmarks file created. File ID:', fileId);
        return fileId;
    };







    const handleBookmarkClick = (bookmark) => {
        const currentUrl = iframeRef.current.src;
        const basePdfUrl = currentUrl.split('#')[0];

        iframeRef.current.src = `${basePdfUrl}#page=${bookmark.page}`;
        iframeRef.current.contentWindow.location.reload(true);

    }


    useEffect(() => {
        getFilesFromDrive();
    }, []);

    useEffect(() => {
        handleFileUpload();
    }, [fileList])

    
    const handleFileUpload = async () => {
        try {
          const uploadPromises = fileList.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
    
            const response = await axios.post(
              `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&parents=${folderId}`,
              formData,
              {
                headers: {
                  'Content-Type': 'application/pdf',
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
    
            console.log('File uploaded:', response.data.name);
          });
    
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error('Error uploading files to Drive:', error);
        }
      };
    

    const handleFileSelect = (files) => {
        setFileList(files);
      };




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
                            <button key={index} onClick={() => handleBookmarkClick(bookmark)}>
                                {bookmark.name} - Page {bookmark.page}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </>
    )
}

export default Workspace;
// import { gapi } from "gapi-script";
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import './dashboard.css';
import LogoSvg from './logosvg';



const Dashboard = () => {
    const location = useLocation();
    const { state } = location;
    const [profile, setProfile] = useState([]);
    const [mainFolderId, setMainFolderId] = useState(null);

    const user = state?.user || null;
    const accessToken = user.access_token;

    // to store data of cards
    const [cards, setCards] = useState([]);
    const [cardData, setCardData] = useState([]);
    const [driveFolders, setDriveFolders] = useState([]);

    const [cardName, setCardName] = useState('');
    const [isCustomBlockVisible, setCustomBlockVisible] = useState(false);
    const [workspaceOptions, setWorkspaceOptions] = useState([]);
    const [isConfirmationPopupVisible, setConfirmationPopupVisible] = useState(false);
    const [selectedCardToDelete, setSelectedCardToDelete] = useState(null);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [isContextMenuVisible, setContextMenuVisible] = useState(false);


    const showCustomBlock = () => {
        setCustomBlockVisible(true);
    };

    const hideCustomBlock = () => {
        setCustomBlockVisible(false);
        setCardName('');
    };

    const addCardDataToList = (cardName, folderId) => {
        setCardData(prevList => [...prevList, { name: cardName, id: folderId }]);
    }

    const cardNameExists = (name, container) => {
        for (const existingCard of container) {
            if (existingCard.name === name) {
                return true;
            }
        }
        return false;
    };

    const addCardFromCustomBlock = async () => {

        if (cardName.trim() !== '' && !cardNameExists(cardName, cards)) {
            try {

                const apiUrl = 'https://www.googleapis.com/drive/v3/files';
                const folderName = cardName;
                const focusFlowId = mainFolderId;

                console.log('Id of parent folder: ', focusFlowId);

                // Check if the folder already exists
                const checkResponse = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
                    },
                });

                if (checkResponse.data.files.length > 0) {
                    console.log('Folder already exists:', checkResponse.data.files[0]);
                    addCardDataToList(checkResponse.data.files[0].name, checkResponse.data.files[0].id);
                } else {
                    // If the folder doesn't exist, create it
                    const createResponse = await axios.post(apiUrl, {
                        name: folderName,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [focusFlowId],
                    }, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    console.log('Workspace created successfully:', createResponse.data);
                    addCardDataToList(createResponse.name, createResponse.id);
                }
            } catch (error) {
                console.error('Error checking or creating workspace:', error);
            }


            const newCard = (
                <div className="card" key={cardName} onContextMenu={(e) => showContextMenu(e, newCard)}>
                    <div className="card-img"></div>
                    <div className="card-footer">{cardName}</div>
                </div>
            );

            setCards([...cards, newCard]);


            const newWorkspaceOption = (
                <a href="#" key={cardName} onClick={() => showConfirmationPopup(newCard)}>
                    {cardName}
                </a>
            );

            setWorkspaceOptions([...workspaceOptions, newWorkspaceOption]);

            hideCustomBlock();


        }
    };

    const deleteCard = async (card) => {
        try {

            console.log(cardData);
            console.log(card);
            const cardToDelete = cardData.find((c) => c.name === card.key);
            console.log(cardToDelete);

            if (!cardToDelete) {
                console.error('Folder not found in the list:', card.name);
                return;
            }


            const apiUrl = `https://www.googleapis.com/drive/v3/files/${cardToDelete.id}`;

            // Make a DELETE request to delete the folder from Google Drive
            await axios.delete(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // If the folder was successfully deleted from Google Drive, update the state
            const updatedCards = cards.filter((c) => c.key !== card.key);
            const updatedCardData = cardData.filter((c) => c.name !== card.key);
            const updatedWorkspaceOptions = workspaceOptions.slice(0, -1);

            setCards(updatedCards);
            setCardData(updatedCardData);
            setWorkspaceOptions(updatedWorkspaceOptions);

        } catch (error) {
            console.error('Error deleting folder:', error);
            // Handle the error as needed
        }
    };

    const returnToLoginPage = () => {
        // Add the functionality to return to the login page here
        alert('Returning to Login Page');
    };

    
    const showContextMenu = (event, card) => {
        event.preventDefault();
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
        setSelectedCardToDelete(card);
        setContextMenuVisible(true);
    };

    const hideContextMenu = () => {
        setContextMenuVisible(false);
    };

    const confirmDelete = () => {
        deleteCard(selectedCardToDelete);
        setConfirmationPopupVisible(false);
    };

    const showConfirmationPopup = (card) => {
        setConfirmationPopupVisible(true);
        hideContextMenu();

        // setSelectedCardToDelete(card);
    };

    const hideConfirmationPopup = () => {
        setConfirmationPopupVisible(false);
        setSelectedCardToDelete(null);
    };



    const checkAndCreateFolder = async (folder_name) => {
        try {
            const accessToken = user.access_token; // Replace with your access token
            const apiUrl = 'https://www.googleapis.com/drive/v3/files';
            const folderName = folder_name;

            // Check if the folder already exists
            const checkResponse = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
                },
            });

            if (checkResponse.data.files.length > 0) {
                console.log('Folder already exists:', checkResponse.data.files[0]);
                setMainFolderId(checkResponse.data.files[0].id);
                
                getDriveFolders(checkResponse.data.files[0].id);
                // console.log('id of parent folder: ', mainFolderId);
                // console.log('id of parent folder: ', checkResponse.data.files[0].id);
            } else {
                // If the folder doesn't exist, create it
                const createResponse = await axios.post(apiUrl, {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Folder created successfully:', createResponse.data);
                setMainFolderId(createResponse.data.id);

                getDriveFolders(createResponse.data.id);
                // console.log('id of parent folder: ', mainFolderId);
                // console.log('id of parent folder: ', createResponse.data.id);
            }
        } catch (error) {
            console.error('Error checking or creating folder:', error);
        }
    };


    const getDriveFolders = async (parentFolderId) => {
        try {
            const focusFlowId = parentFolderId;
            const apiUrl = 'https://www.googleapis.com/drive/v3/files';
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    q: `'${focusFlowId}' in parents and mimeType='application/vnd.google-apps.folder'`,
                },
            });

            const folders = response.data.files;
            // console.log('Folders within the specified folder:', folders);

            folders.forEach((folder) => {
                console.log(folder);
                if (folder.name.trim() !== '' && !cardNameExists(folder.name, cards)) {
                    
                    addCardDataToList(folder.name, folder.id);

                    const newCard = (
                        <div className="card" key={folder.name} onContextMenu={(e) => showContextMenu(e, newCard)}>
                            <div className="card-img"></div>
                            <div className="card-footer">{folder.name}</div>
                        </div>
                    );

                    setCards([...cards, newCard]);
                    const newWorkspaceOption = (
                        <a href="#" key={cardName} onClick={() => showConfirmationPopup(newCard)}>
                            {cardName}
                        </a>
                    );
        
                    setWorkspaceOptions([...workspaceOptions, newWorkspaceOption]);
        
                    hideCustomBlock();


                }
                // setCardName(folder.name);
                // addCardFromCustomBlock();
              });
      

            
        } catch (error) {
            console.error('Error fetching folders:', error);
          }
    };


    useEffect(() => {
        console.log(user)

        axios
            .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
                {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        Accept: 'application/json'
                    }
                })
            .then((res) => {
                setProfile(res.data);
                console.log(res.data);

            })
            .catch((err) => console.log(err));


        // Call the function to check and create the folder when the component mounts
        checkAndCreateFolder('FocusFlow');


    },
        [user]
    );


    return (
        <>
            <div className='dash'>
                <nav>
                    <LogoSvg />
                    <button onClick={showCustomBlock} title="Add Card">
                        +
                    </button>
                    <button className="return-btn" onClick={returnToLoginPage} title="Return to Login Page">
                        Return to Login Page
                    </button>
                </nav>

                <div className="workspace-dropdown" id="workspaceDropdown">
                    {workspaceOptions}
                </div>

                <div className="container">
                    <div className="cards-container" id="cardsContainer">
                        {cards}
                    </div>
                </div>

                {isCustomBlockVisible && (
                    <div>
                        <div className="custom-overlay" onClick={hideCustomBlock}></div>
                        <div className="custom-block">
                            <label htmlFor="cardName">Enter Card Name:</label>
                            <input
                                type="text"
                                id="cardName"
                                placeholder="Card Name"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                            />
                            <button onClick={addCardFromCustomBlock}>Add Card</button>
                            <button onClick={hideCustomBlock}>Cancel</button>
                        </div>
                    </div>
                )}

                {isConfirmationPopupVisible && (
                    <div className="confirmation-popup">
                        <label>Are you sure you want to delete this card?</label>
                        <div className="confirmation-popup-buttons">
                            <button className="confirm" onClick={confirmDelete}>
                                Confirm
                            </button>
                            <button className="cancel" onClick={hideConfirmationPopup}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {isContextMenuVisible && (
                    <div
                        className="context-menu"
                        style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
                    >
                        <div className="context-menu-item delete" onClick={showConfirmationPopup}>
                            Delete
                        </div>
                        <div className="context-menu-item cancel" onClick={hideContextMenu}>
                            Cancel
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Dashboard;

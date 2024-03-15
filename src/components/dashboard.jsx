import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin, useGoogleLogout } from '@react-oauth/google';
import axios from 'axios';

import './dashboard.css';
import LogoSvg from './logosvg';



const Dashboard = () => {
    // To navigate to other pages and to get the passed variables
    const navigate = useNavigate();
    const location = useLocation();

    // Get user access token
    const { state } = location;
    const user = state?.user || null;
    const accessToken = user.access_token;

    // ID of FocusFlow folder in user's drive
    const [mainFolderId, setMainFolderId] = useState(null);


    // to store renders of cards
    const [cards, setCards] = useState([]);

    // to store data of cards
    const [cardData, setCardData] = useState([]);

    // Required for creating cards
    const [cardName, setCardName] = useState('');

    // For UI of Page
    const [isCustomBlockVisible, setCustomBlockVisible] = useState(false);
    const [workspaceOptions, setWorkspaceOptions] = useState([]);
    const [isConfirmationPopupVisible, setConfirmationPopupVisible] = useState(false);
    const [selectedCardToDelete, setSelectedCardToDelete] = useState(null);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [isContextMenuVisible, setContextMenuVisible] = useState(false);


    // Go to clicked card's workspace
    const goToWorkspace = (name, id) => {
        navigate(`/workspace/${name}`, { state: { name, id, accessToken } });
    }



    /*
    FOR UI TRANSITIONS FOR THE PAGE
    */

    const showCustomBlock = () => {
        setCustomBlockVisible(true);
    };

    const hideCustomBlock = () => {
        setCustomBlockVisible(false);
        setCardName('');
    };


    const returnToLoginPage = () => {
        // Add the functionality to return to the login page here
        // alert('Returning to Login Page');
        logout();
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
    };

    const hideConfirmationPopup = () => {
        setConfirmationPopupVisible(false);
        setSelectedCardToDelete(null);
    };


    /*
    CARD RELATED FUNCTIONS
    */


    // New Card Add
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
                <div
                    className="card"
                    key={cardName}
                    onContextMenu={(e) => showContextMenu(e, newCard)}
                    onDoubleClick={() => goToWorkspace(cardName, getCardId(cardName, cardData))}
                >
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

    const addCardDataToList = (cardName, folderId) => {
        setCardData(prevList => [...prevList, { name: cardName, id: folderId }]);
    }

    const cardNameExists = (name, container) => {
        for (const existingCard of container) {
            if (existingCard.key === name) {
                return true;
            }
        }
        return false;
    };

    const getCardId = (name, container) => {
        for (const existingCard of container) {
            if (existingCard.name === name) {
                return existingCard.id;
            }
        }
        return null;
    }

    const deleteCard = async (card) => {
        try {

            const cardToDelete = cardData.find((c) => c.name === card.key);

            if (!cardToDelete) {
                console.error('Folder not found in the list:', card.key);
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

            console.log('Successfully deleted ', cardToDelete.name);

        } catch (error) {
            console.error('Error deleting folder:', error);
            // Handle the error as needed
        }
    };

    const logout = useGoogleLogout({
        onLogoutSuccess: () => {
            // Perform any additional actions after logout if needed
            navigate('/');
            console.log('Logout successful');
        },
        onFailure: (error) => {
            console.error('Logout failed:', error);
        }
    });



    /*
    DRIVE RELATED OPERATIONS
    */

    const checkAndCreateFolder = async (folder_name) => {
        try {
            const accessToken = user.access_token;
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
            console.log('Folders in drive FocusFlow');
            console.log(folders);

            folders.forEach((folder) => {
                if (folder.name.trim() !== '' && !cardNameExists(folder.name, cards)) {

                    addCardDataToList(folder.name, folder.id);

                    const newCard = (
                        <div
                            className="card"
                            key={folder.name}
                            onContextMenu={(e) => showContextMenu(e, newCard)}
                            onDoubleClick={() => goToWorkspace(folder.name, folder.id)}
                        >
                            <div className="card-img"></div>
                            <div className="card-footer">{folder.name}</div>
                        </div>
                    );

                    setCards([...cards, newCard]);

                    const newWorkspaceOption = (
                        <a href="#" key={folder.name} onClick={() => showConfirmationPopup(newCard)}>
                            {folder.name}
                        </a>
                    );

                    setWorkspaceOptions([...workspaceOptions, newWorkspaceOption]);

                }
            });

        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };


    // On Render
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
                console.log('User Info')
                console.log(res.data);
            })
            .catch((err) => console.log(err));


        // Call the function to check and create the folder when the component mounts
        checkAndCreateFolder('FocusFlow');
        getDriveFolders(mainFolderId);


    },
        [user, mainFolderId, cards]
    );


    return (
        <>
            <div className='dash'>
                <div class="star-field">
                    <div class="layer"></div>
                    <div class="layer"></div>
                    <div class="layer"></div>
                </div>
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

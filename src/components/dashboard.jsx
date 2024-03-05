// import { gapi } from "gapi-script";
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import './tempDash.css';
import LogoSvg from './logosvg';



const Dashboard = () => {
    const location = useLocation();
    const { state } = location;
    const [ profile, setProfile ] = useState([]);
    
    const user = state?.user || null;


    const [cardName, setCardName] = useState('');
    const [isCustomBlockVisible, setCustomBlockVisible] = useState(false);
    const [cards, setCards] = useState([]);
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

    const addCardFromCustomBlock = () => {
        if (cardName.trim() !== '' && !cardNameExists(cardName, cards)) {
            const newCard = (
                <div className="card" key={cardName}  onContextMenu={(e) => showContextMenu(e, newCard)}>
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

    const returnToLoginPage = () => {
        // Add the functionality to return to the login page here
        alert('Returning to Login Page');
    };

    const deleteCard = (card) => {
        const updatedCards = cards.filter((c) => c.key !== card.key);
        const updatedWorkspaceOptions = workspaceOptions.slice(0, -1);

        setCards(updatedCards);
        setWorkspaceOptions(updatedWorkspaceOptions);
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

    const cardNameExists = (name, container) => {
        for (const existingCard of container) {
            if (existingCard.key === name) {
                return true;
            }
        }
        return false;
    };


    useEffect(()=>{
        console.log(user)

        axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
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
            }, 
            [user]
    );


    return (
        <>
        <div className='dash'>
            <nav>
                <LogoSvg/>
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

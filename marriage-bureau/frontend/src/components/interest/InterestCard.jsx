import React from 'react';
import './InterestCard.css';

const InterestCard = ({ interest, onAccept, onReject }) => {
    return (
        <div className="interest-card">
            <div className="interest-content">
                <h3 className="sender-name">{interest.senderName}</h3>
                <p className="sender-email">{interest.senderEmail}</p>
            </div>
            <div className="interest-actions">
                <button 
                    className="btn btn-accept" 
                    onClick={() => onAccept(interest.id)}
                >
                    Accept
                </button>
                <button 
                    className="btn btn-reject" 
                    onClick={() => onReject(interest.id)}
                >
                    Reject
                </button>
            </div>
        </div>
    );
};

export default InterestCard;
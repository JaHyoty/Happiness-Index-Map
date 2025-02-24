import React, { useState, useEffect } from 'react';
import chroma from 'chroma-js';

const Sidebar = ({ zipCode, data, useremail, onClose, onSurveyClick }) => {
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');
    const [suggestSurvey, setSuggestSurvey] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [crimeData, setCrimeData] = useState([]);

    useEffect(() => {
        if (zipCode && useremail) {
            setUserLoggedIn(true);
            fetchComments();
            fetchCrimeData();
        } else {
            setUserLoggedIn(false);
            setComments([]);
            setCrimeData([]);
            setError('');
        }
    }, [zipCode, useremail]);

    const fetchComments = () => {
        fetch(`/api/comments?useremail=${useremail}&zipcode=${zipCode}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    if (data.reason === 'no-access') {
                        setSuggestSurvey(true)
                    }
                    setError(data.error);
                } else {
                    setComments(data);
                    setSuggestSurvey(false);
                    setError('');
                }
            })
            .catch((error) => {
                console.error('Error fetching sidebar data:', error);
                setError('Failed to fetch comments. Please try again later.');
            });
    };

    const getBarColor = (value, minRange, maxRange) => {
        const scale = chroma.scale(['#FF0000', '#00FF00']).domain([minRange, maxRange]);
        return scale(value).hex();
    };

    const getCrimeBarColor = (value, minRange, maxRange) => {
        const scale = chroma.scale(['#00FF00', '#FF0000']).domain([minRange, maxRange]);
        return scale(value).hex();
    };

    const fetchCrimeData = () => {
        fetch(`/api/crime?useremail=${useremail}&zipcode=${zipCode}`)
            .then((response) => response.json())
            .then((data) => setCrimeData(data))
            .catch((error) => {
                console.error('Error fetching crime data:', error);
                setError('Failed to fetch crime data. Please try again later.');
            });
    };

    if (!zipCode) {
        return null;
    }

    return (
        <div className="sidebar">
            <button onClick={onClose}>Close</button>
            <h2>Details for Zip Code: {zipCode}</h2>

            <div className="bar-container">
                <span><b>Happiness Score</b></span>
                <div className="bar top-bar" style={{ width: `${data.totalHappinessScore}%`, backgroundColor: getBarColor(data.totalHappinessScore, 55, 65) }}>
                    {Math.round(data.totalHappinessScore)}
                </div>
            </div>

            <div className="bar-container">
                <span><b>Economic Wellbeing</b></span>
                <div className="bar" style={{ width: `${data.economicWellbeingScore * 4}%`, backgroundColor: getBarColor(data.economicWellbeingScore, 0, 25) }}>
                    {Math.round(data.economicWellbeingScore)}
                </div>
            </div>

            <div className="bar-container">
                <span><b>Family & Relationships</b></span>
                <div className="bar" style={{ width: `${data.familyAndRelationshipsScore * 4}%`, backgroundColor: getBarColor(data.familyAndRelationshipsScore, 0, 25) }}>
                    {Math.round(data.familyAndRelationshipsScore)}
                </div>
            </div>

            <div className="bar-container">
                <span><b>Physical & Mental Wellbeing</b></span>
                <div className="bar" style={{ width: `${data.physicalAndMentalWellbeingScore * 4}%`, backgroundColor: getBarColor(data.physicalAndMentalWellbeingScore, 0, 25) }}>
                    {Math.round(data.physicalAndMentalWellbeingScore)}
                </div>
            </div>

            <div className="bar-container">
                <span><b>Environmental & Societal Wellness</b></span>
                <div className="bar" style={{ width: `${data.environmentalAndSocietalWellnessScore * 4}%`, backgroundColor: getBarColor(data.environmentalAndSocietalWellnessScore, 0, 25) }}>
                    {Math.round(data.environmentalAndSocietalWellnessScore)}
                </div>
            </div>

            <div className="comments-section">
                <h3>What people living here say</h3>
                {suggestSurvey ? (
                    <div>To see what other users think, complete a survey about your own living area.</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : comments.length > 0 ? (
                    comments.slice(0, 5).map((comment, index) => (
                        <div key={index} className="comment-box">
                            {comment}
                        </div>
                    ))
                ) : !userLoggedIn ? (
                    <div>Please register or login to see what others are saying about living here!</div>
                ) : (
                    <div>No comments available.</div>
                )}
            </div>

            <div className="crime-stats-section">
                <h3>Recent Crime Statistics</h3>
                {suggestSurvey ? (
                    <div>To see what other users think, complete a survey about your own living area.
                        <button
                            onClick={onSurveyClick}
                            style={{
                                marginTop: "16px",
                                padding: "8px 16px",
                                cursor: "pointer",
                                position: 'static'
                            }}
                        >
                            Complete a survey here!
                        </button>
                    </div>
                ) : crimeData.length > 0 ? (
                    crimeData.map((crime, index) => (
                        <div key={index} className="bar-container">
                            <span className='crime-header'>{crime.eventType}</span>
                            <div className="bar crime-bar" style={{ 
                                width: `${Math.min(crime.eventCount, 80)}%`, 
                                backgroundColor: getCrimeBarColor(crime.eventCount, 0, 100) 
                                }}>
                            </div> 
                        </div>))
                ) : !userLoggedIn ? (
                    <div>Please register or login to see crime statistics in the area!</div>
                ) : (
                    <div>No recent crime data available.</div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;

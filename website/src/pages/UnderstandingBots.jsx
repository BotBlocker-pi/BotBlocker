import React, { useState, useEffect } from 'react';
import '../css/pages/UnderstandingBots.css';
import Navbar from '../components/global/Navbar.jsx'; // Import the Navbar component

const UnderstandBots = () => {
    const [activeSection, setActiveSection] = useState('what-are-bots');

    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="understand-container">
            {/* Use the Navbar component instead of embedded header */}
            <Navbar />

            <main className="understand-content">
                <h1 className="page-title">Understanding Social Media Bots</h1>
                <p className="intro-text">
                    In today's digital landscape, social media bots have become increasingly sophisticated.
                    Learn how to identify them and protect your online experience.
                </p>

                <div className="content-container">
                    <div className="tabs-container">
                        <button
                            className={`tab-button ${activeSection === 'what-are-bots' ? 'active' : ''}`}
                            onClick={() => handleSectionChange('what-are-bots')}
                        >
                            What Are Bots?
                        </button>
                        <button
                            className={`tab-button ${activeSection === 'how-to-identify' ? 'active' : ''}`}
                            onClick={() => handleSectionChange('how-to-identify')}
                        >
                            How to Identify Bots
                        </button>
                        <button
                            className={`tab-button ${activeSection === 'impacts' ? 'active' : ''}`}
                            onClick={() => handleSectionChange('impacts')}
                        >
                            Impact on Social Media
                        </button>
                        <button
                            className={`tab-button ${activeSection === 'our-tech' ? 'active' : ''}`}
                            onClick={() => handleSectionChange('our-tech')}
                        >
                            Our Technology
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeSection === 'what-are-bots' && (
                            <div className="section">
                                <h2>What Are Social Media Bots?</h2>
                                <div className="info-card">
                                    <div className="card-header">
                                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="10" rx="2" />
                                            <circle cx="12" cy="5" r="2" />
                                            <path d="M12 7v4" />
                                            <line x1="8" y1="16" x2="8" y2="16" />
                                            <line x1="16" y1="16" x2="16" y2="16" />
                                        </svg>
                                        <h3>Definition</h3>
                                    </div>
                                    <p>
                                        Social media bots are automated accounts that simulate human behavior on social platforms.
                                        They can post content, like posts, follow users, and even engage in conversations with real
                                        people using advanced AI technologies.
                                    </p>
                                </div>

                                {/* Rest of the what-are-bots section content unchanged */}
                                <div className="info-card">
                                    <div className="card-header">
                                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        <h3>Types of Bots</h3>
                                    </div>
                                    <ul className="bot-types">
                                        <li>
                                            <strong>Spam Bots:</strong> Distribute unwanted content and advertisements
                                        </li>
                                        <li>
                                            <strong>Political Bots:</strong> Amplify political messages and influence public opinion
                                        </li>
                                        <li>
                                            <strong>Follower Bots:</strong> Artificially inflate follower counts
                                        </li>
                                        <li>
                                            <strong>AI Conversation Bots:</strong> Engage with users through advanced language models
                                        </li>
                                        <li>
                                            <strong>Content Bots:</strong> Automatically generate and share content
                                        </li>
                                    </ul>
                                </div>

                                <div className="stats-container">
                                    <div className="stat-item">
                                        <div className="stat-number">80%</div>
                                        <div className="stat-label">of Twitter accounts posting about trending topics are bots</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">5-15%</div>
                                        <div className="stat-label">of social media accounts are estimated to be bots</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">18x</div>
                                        <div className="stat-label">more likely to share misinformation than human accounts</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Keep all the other sections unchanged */}
                        {activeSection === 'how-to-identify' && (
                            /* How to identify section content */
                            <div className="section">
                                {/* Content unchanged */}
                                <h2>How to Identify Social Media Bots</h2>
                                <div className="info-card">
                                    <div className="card-header">
                                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 16v-4" />
                                            <path d="M12 8h.01" />
                                        </svg>
                                        <h3>Common Signs of Bot Accounts</h3>
                                    </div>
                                    <ul className="check-list">
                                        <li>Generic or strange profile pictures</li>
                                        <li>Usernames with random numbers and characters</li>
                                        <li>Abnormally high posting frequency</li>
                                        <li>Posts at consistent intervals (e.g., exactly every hour)</li>
                                        <li>Limited original content</li>
                                        <li>Primarily shares/retweets without adding value</li>
                                        <li>Account created recently but has high activity</li>
                                        <li>Limited personal information</li>
                                        <li>Repetitive language patterns</li>
                                    </ul>
                                </div>

                                {/* Example comparisons section remains the same */}
                                <div className="example-container">
                                    {/* Content unchanged */}
                                    <div className="example-card human">
                                        <h4>Human Account Example</h4>
                                        <div className="profile-example">
                                            <div className="profile-header">
                                                <div className="profile-pic human"></div>
                                                <div className="profile-info">
                                                    <div className="profile-name">Sarah Johnson</div>
                                                    <div className="profile-handle">@sarah_travels</div>
                                                    <div className="profile-joined">Joined March 2018</div>
                                                </div>
                                            </div>
                                            <div className="profile-bio">
                                                Travel photographer, coffee enthusiast, and dog mom.
                                                Based in Seattle but usually somewhere else.
                                                Check out my photography website: sarahjphoto.com
                                            </div>
                                            <div className="activity-pattern">
                                                <h5>Activity Pattern:</h5>
                                                <ul>
                                                    <li>Posts vary in frequency (busy some days, quiet others)</li>
                                                    <li>Content includes personal photos, stories, and opinions</li>
                                                    <li>Interacts with replies in conversational, unique ways</li>
                                                    <li>Posts at varying times throughout the day</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="example-card bot">
                                        <h4>Bot Account Example</h4>
                                        <div className="profile-example">
                                            <div className="profile-header">
                                                <div className="profile-pic bot"></div>
                                                <div className="profile-info">
                                                    <div className="profile-name">John Smith</div>
                                                    <div className="profile-handle">@john83729465</div>
                                                    <div className="profile-joined">Joined January 2025</div>
                                                </div>
                                            </div>
                                            <div className="profile-bio">
                                                News enthusiast. Follow for the latest updates.
                                                #news #politics #trending
                                            </div>
                                            <div className="activity-pattern">
                                                <h5>Activity Pattern:</h5>
                                                <ul>
                                                    <li>Posts exactly 24 times per day (once every hour)</li>
                                                    <li>Content primarily consists of retweets and links</li>
                                                    <li>Generic responses like "Interesting!" or "Thanks!"</li>
                                                    <li>Follows thousands but has few followers</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'impacts' && (
                            /* Impacts section content */
                            <div className="section">
                                {/* Content unchanged */}
                                <h2>Impact of Bots on Social Media</h2>
                                <div className="impact-grid">
                                    <div className="impact-card negative">
                                        <div className="impact-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
                                                <path d="M22 8h-6" />
                                            </svg>
                                        </div>
                                        <h3>Negative Impacts</h3>
                                        <ul>
                                            <li>Spreads misinformation and fake news</li>
                                            <li>Manipulates public opinion and political discourse</li>
                                            <li>Creates artificial trends and viral content</li>
                                            <li>Reduces trust in online information</li>
                                            <li>Inflates metrics for advertisers and platforms</li>
                                            <li>Can harass and intimidate real users</li>
                                        </ul>
                                    </div>

                                    <div className="impact-card positive">
                                        <div className="impact-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                                                <path d="M2 16h6" />
                                            </svg>
                                        </div>
                                        <h3>Beneficial Bots</h3>
                                        <ul>
                                            <li>Customer service and support automation</li>
                                            <li>News and emergency alerts</li>
                                            <li>Content moderation assistance</li>
                                            <li>Educational tools and resources</li>
                                            <li>Creative and entertainment bots</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="case-study">
                                    <h3>Case Study: Election Interference</h3>
                                    <p>
                                        During recent elections worldwide, coordinated networks of bots have been used to
                                        amplify certain political messages, suppress others, and create the illusion of
                                        widespread support for particular viewpoints. These bot networks can generate thousands
                                        of posts per day, potentially reaching millions of genuine users and influencing
                                        both public discourse and voting decisions.
                                    </p>
                                    <div className="case-study-stats">
                                        <div className="cs-stat">
                                            <span className="cs-number">70%</span>
                                            <span className="cs-label">of political links during key election periods were shared by suspected bots</span>
                                        </div>
                                        <div className="cs-stat">
                                            <span className="cs-number">150,000+</span>
                                            <span className="cs-label">bot accounts identified in coordinated influence campaigns</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'our-tech' && (
                            /* Our tech section content */
                            <div className="section">
                                {/* Content unchanged */}
                                <h2>Our Bot Detection Technology</h2>
                                <div className="tech-overview">
                                    <p className="tech-intro">
                                        BotBlocker is a website and browser extension developed to help users identify AI-managed
                                        profiles on social media platforms. Our community-driven approach combines human verification
                                        with specialized user roles to create a reliable detection system.
                                    </p>

                                    <div className="tech-process">
                                        <div className="process-step">
                                            <div className="step-number">1</div>
                                            <div className="step-content">
                                                <h4>Community Assessment</h4>
                                                <p>BotBlocker users (BB_users) can evaluate social media profiles with a simple yes/no voting system on whether the profile is managed by AI. User evaluations help build our community-driven database.</p>
                                            </div>
                                        </div>

                                        <div className="process-step">
                                            <div className="step-number">2</div>
                                            <div className="step-content">
                                                <h4>Verification System</h4>
                                                <p>Verified assessments are performed by authorized "verifiers" who have access to a special interface where they can definitively mark profiles as human or AI-managed.</p>
                                            </div>
                                        </div>

                                        <div className="process-step">
                                            <div className="step-number">3</div>
                                            <div className="step-content">
                                                <h4>Detailed Feedback</h4>
                                                <p>When a profile is flagged as AI-managed, users can specify the reason for their assessment, creating a more comprehensive database of bot characteristics.</p>
                                            </div>
                                        </div>

                                        <div className="process-step">
                                            <div className="step-number">4</div>
                                            <div className="step-content">
                                                <h4>Customizable Filtering</h4>
                                                <p>Through our browser extension, users can customize which profiles they want to hide from their social media feeds based on community ratings and verification status.</p>
                                            </div>
                                        </div>

                                        <div className="process-step">
                                            <div className="step-number">5</div>
                                            <div className="step-content">
                                                <h4>Google Account Integration</h4>
                                                <p>BB_users who want to evaluate profiles need to sign in with their Google account, ensuring accountability and preventing abuse of the voting system.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="try-it-container">
                                    <h3>Try BotBlocker Today</h3>
                                    <p>
                                        Enter any social media profile URL to check if it's managed by a real person or
                                        AI bot,
                                        or download our browser extension for seamless integration with your social
                                        media browsing.
                                    </p>
                                    <div className="try-buttons">
                                        <a href="/" className="try-it-button">
                                            Check a Profile
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14" />
                                                <path d="M12 5l7 7-7 7" />
                                            </svg>
                                        </a>
                                        <a href="/download" className="try-it-button secondary">
                                            Download Extension
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <p>© 2025 BotBlocker. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Use</a>
                        <a href="/contact">Contact Us</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UnderstandBots;
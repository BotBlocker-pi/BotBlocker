import React, { useState, useEffect } from 'react';
import '../css/Contact.css';
import botBlockerLogo from '../assets/logo.png'; // Adjust the path as needed

const Contact = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        // Add animation class after component mounts
        setIsLoaded(true);

        // Make sure the page scrolls to top when loaded
        window.scrollTo(0, 0);

        // Enable scrolling on body
        document.body.style.overflow = 'auto';
    }, []);

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }

        if (!formData.subject.trim()) {
            errors.subject = "Subject is required";
        }

        if (!formData.message.trim()) {
            errors.message = "Message is required";
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateForm();

        if (Object.keys(errors).length === 0) {
            // Form is valid, submit it (this would connect to your backend)
            console.log("Form submitted:", formData);
            setIsSubmitted(true);

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } else {
            setFormErrors(errors);
        }
    };

    return (
        <div className={`contact-container ${isLoaded ? 'fade-in' : ''}`}>
            <header className="header">
                <div className="logo-container">
                    <div className="logo-wrapper">
                        <img src={botBlockerLogo} alt="BotBlocker Logo" className="logo" />
                    </div>
                </div>
                <nav className="navigation">
                    <a href="/" className="nav-link">HOME</a>
                    <a href="/understand-bots" className="nav-link">UNDERSTAND BOTS</a>
                    <a href="/contact" className="nav-link active">CONTACT</a>
                </nav>
            </header>

            <main className="contact-content">
                <h1 className="page-title">Contact Us</h1>
                <p className="intro-text">
                    Have questions about BotBlocker or need assistance? We'd love to hear from you.
                    Fill out the form below and our team will get back to you as soon as possible.
                </p>

                <div className="contact-wrapper">
                    <div className="contact-info">
                        <div className="info-card">
                            <div className="info-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div className="info-content">
                                <h3>Location</h3>
                                <p>Aveiro, Portugal</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </div>
                            <div className="info-content">
                                <h3>Email</h3>
                                <p>infobotblocker@gmail.com</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </div>
                            <div className="info-content">
                                <h3>Support</h3>
                                <p>support@botblocker.com</p>
                            </div>
                        </div>

                        <div className="social-links">
                            <h3>Connect With Us</h3>
                            <div className="social-icons">
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                    </svg>
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                        <rect x="2" y="9" width="4" height="12"></rect>
                                        <circle cx="4" cy="4" r="2"></circle>
                                    </svg>
                                </a>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        {isSubmitted ? (
                            <div className="success-message">
                                <div className="success-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                </div>
                                <h3>Message Sent Successfully!</h3>
                                <p>Thank you for reaching out. We'll get back to you as soon as possible.</p>
                                <button className="reset-form" onClick={() => setIsSubmitted(false)}>Send Another Message</button>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <h2>Send Us a Message</h2>

                                <div className="form-group">
                                    <label htmlFor="name">Your Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={formErrors.name ? 'error' : ''}
                                    />
                                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={formErrors.email ? 'error' : ''}
                                    />
                                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className={formErrors.subject ? 'error' : ''}
                                    />
                                    {formErrors.subject && <span className="error-message">{formErrors.subject}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Your Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className={formErrors.message ? 'error' : ''}
                                    ></textarea>
                                    {formErrors.message && <span className="error-message">{formErrors.message}</span>}
                                </div>

                                <button type="submit" className="submit-button">
                                    Send Message
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="faq-section">
                    <h2>Frequently Asked Questions</h2>

                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3>How does BotBlocker identify AI accounts?</h3>
                            <p>BotBlocker uses a community-driven approach where users vote on profiles, combined with verification from authorized verifiers. This creates a reliable system to identify AI-managed accounts.</p>
                        </div>

                        <div className="faq-item">
                            <h3>Is the BotBlocker extension free?</h3>
                            <p>Yes, the BotBlocker browser extension is completely free to use. We're committed to making social media a more transparent space for everyone.</p>
                        </div>

                        <div className="faq-item">
                            <h3>How can I become a verifier?</h3>
                            <p>Verifiers are selected based on their activity and contribution to the BotBlocker community. Active users who consistently provide accurate assessments may be invited to become verifiers.</p>
                        </div>

                        <div className="faq-item">
                            <h3>Which social media platforms are supported?</h3>
                            <p>BotBlocker currently supports major social media platforms including Twitter, Facebook, Instagram, and LinkedIn. We're continuously working to expand our coverage.</p>
                        </div>
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

            {/* Add padding at the bottom to prevent footer overlap */}
            <div style={{ height: '60px' }}></div>
        </div>
    );
};

export default Contact;
import React from 'react';
import { Link } from 'react-router-dom';
import WhatsAppButton from './WhatsAppButton';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <h1>Experience Morocco with <br /><span className="highlight">Comfort & Style</span></h1>
        <p>Reliable transport services for your perfect journey. From airport transfers to desert excursions.</p>
        <div className="hero-actions">
          <Link to="/booking" className="btn btn-primary btn-lg">Start Your Journey</Link>
          <WhatsAppButton
            message="Hello! I'm interested in booking a transport service in Morocco."
            className="btn-lg"
          />
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          height: 100vh;
          width: 100%;
          background-image: url('/hero-bg.png');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          color: white;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3));
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
        }

        .hero h1 {
          font-size: 4rem;
          margin-bottom: var(--spacing-md);
          color: white;
        }

        .highlight {
          color: var(--color-secondary);
        }

        .hero p {
          font-size: 1.25rem;
          margin-bottom: var(--spacing-xl);
          opacity: 0.9;
          max-width: 600px;
        }

        .hero-actions {
          display: flex;
          gap: var(--spacing-md);
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }

        .glass {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          backdrop-filter: blur(5px);
        }

        .glass:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: white;
        }
      `}</style>
    </section>
  );
};

export default Hero;

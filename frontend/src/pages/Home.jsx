import React from 'react';
import { Link } from 'react-router-dom';
import PriceCalculator from '../components/PriceCalculator';
import Hero from '../components/Hero';
import PriceEstimator from '../components/PriceEstimator';

const Home = () => {
    return (
        <div className="home-page">
            <Hero />

            <section id="estimator" className="section" style={{ background: 'var(--color-bg)' }}>
                <div className="container">
                    <PriceCalculator />
                </div>
            </section>

            <section id="services" className="section container">
                <h2 className="text-center mb-8">Our Services</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="card">
                        <h3>Airport Transfers</h3>
                        <p>Seamless pickup and drop-off at all major Moroccan airports.</p>
                    </div>
                    <div className="card">
                        <h3>Intercity Trips</h3>
                        <p>Comfortable travel between cities with professional drivers.</p>
                    </div>
                    <div className="card">
                        <h3>Desert Excursions</h3>
                        <p>Unforgettable journeys to Merzouga and Zagora dunes.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

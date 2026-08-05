/**
 * Home Page - Public
 * Complete landing page with Landing, Features, and Footer sections
 */

import React from 'react';
import LandingSection from './LandingSection';
import FeaturesSection from './FeaturesSection';

const Home = () => {
  return (
    <div className="min-h-screen">
      <LandingSection />
      <FeaturesSection />
    </div>
  );
};

export default Home;
/**
 * Home Page - Full Width
 */

import React from 'react';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';

const Home = () => {
  return (
    <div className="w-full">
      <Hero />
      <Features />
      <HowItWorks />
    </div>
  );
};

export default Home;
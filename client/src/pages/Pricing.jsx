import React from 'react';
import { motion } from 'framer-motion';
import PricingPlans from '../components/Pricing/PricingPlans';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8"
        >
          <FiArrowLeft className="mr-2" />
          Вернуться в личный кабинет
        </Link>
        
        <PricingPlans />
      </div>
    </div>
  );
};

export default Pricing;
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MainNav: React.FC = () => {
  const { t } = useTranslation();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            {t('site.name')}
          </Link>
          
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-blue-600">
              {t('nav.home')}
            </Link>
            <Link to="/about" className="hover:text-blue-600">
              {t('nav.about')}
            </Link>
            <Link to="/contact" className="hover:text-blue-600">
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNav; 
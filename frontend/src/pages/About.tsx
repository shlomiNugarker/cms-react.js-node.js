import React from 'react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{t('about.title')}</h1>
      <div className="prose max-w-none">
        <p>{t('about.content')}</p>
      </div>
    </div>
  );
};

export default About; 
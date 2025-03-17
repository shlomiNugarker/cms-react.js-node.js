import React from 'react';
import { useTranslation } from 'react-i18next';
import ContactForm from '../components/ContactForm';

const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">{t('contact.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('contact.info')}</h2>
            <div className="space-y-4">
              <p>
                <strong>{t('contact.address')}:</strong><br />
                {t('contact.addressValue')}
              </p>
              <p>
                <strong>{t('contact.phone')}:</strong><br />
                {t('contact.phoneValue')}
              </p>
              <p>
                <strong>{t('contact.email')}:</strong><br />
                {t('contact.emailValue')}
              </p>
            </div>
          </div>
          
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 
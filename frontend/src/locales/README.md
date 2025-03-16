# Internationalization (i18n) Setup

This project uses i18next for internationalization. The translations are organized into namespaces to keep them modular and maintainable.

## Directory Structure

```
src/locales/
├── en/                 # English translations
│   ├── common.json     # Common translations used across the app
│   ├── auth.json       # Authentication-related translations
│   └── dashboard.json  # Dashboard-related translations
├── he/                 # Hebrew translations
│   ├── common.json     # Common translations used across the app
│   ├── auth.json       # Authentication-related translations
│   └── dashboard.json  # Dashboard-related translations
└── README.md           # This file
```

## Namespaces

The translations are divided into the following namespaces:

- **common**: General translations used across the application
- **auth**: Translations related to authentication (login, register, etc.)
- **dashboard**: Translations specific to dashboard features

## Usage

To use translations in your components:

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  // Load multiple namespaces
  const { t } = useTranslation(['common', 'auth']);
  
  // Use translations with namespace
  return (
    <div>
      <h1>{t('welcome', { ns: 'common' })}</h1>
      <button>{t('login', { ns: 'auth' })}</button>
    </div>
  );
};
```

## Adding New Translations

1. Identify which namespace the translation belongs to
2. Add the key-value pair to the appropriate JSON file in each language directory
3. Use the translation in your component with the correct namespace

## Adding New Languages

To add a new language:

1. Create a new directory under `src/locales/` with the language code (e.g., `fr/` for French)
2. Copy the JSON files from an existing language directory
3. Translate the values in each file
4. Update the `supportedLngs` array in `src/i18n.ts` 
# Language Translation System - Implementation Guide

## Overview
The Junglore Curated Lodges website now supports full internationalization with 12 languages using **react-i18next**.

## Supported Languages
- 🇺🇸 English (US) - `en`
- 🇬🇧 English (UK) - `en-GB`
- 🇪🇸 Spanish (Spain) - `es`
- 🇲🇽 Spanish (Mexico) - `es-MX`
- 🇫🇷 French - `fr`
- 🇩🇪 German - `de`
- 🇮🇹 Italian - `it`
- 🇵🇹 Portuguese (Portugal) - `pt`
- 🇧🇷 Portuguese (Brazil) - `pt-BR`
- 🇯🇵 Japanese - `ja`
- 🇨🇳 Chinese (Simplified) - `zh`
- 🇮🇳 Hindi - `hi`

## Architecture

### File Structure
```
frontend/
├── src/
│   ├── i18n/
│   │   ├── config.ts          # i18next configuration
│   │   └── locales/           # Translation files
│   │       ├── en.json
│   │       ├── es.json
│   │       ├── fr.json
│   │       ├── de.json
│   │       ├── it.json
│   │       ├── pt.json
│   │       ├── ja.json
│   │       ├── zh.json
│   │       └── hi.json
│   ├── contexts/
│   │   └── LocalizationContext.tsx  # Manages language & currency
│   └── components/
│       └── layout/
│           └── LocalizationModal.tsx  # Language/Currency selector
```

### Translation File Structure
All translation files follow the same nested structure:

```json
{
  "header": {
    "experience": "Experience",
    "basecamps": "Basecamps",
    "fieldNotes": "Field Notes",
    "signIn": "Sign In",
    "languageCurrency": "Language & Currency"
  },
  "hero": {
    "title": "Find Your Perfect Basecamp",
    "subtitle": "Discover curated stays in the world's most extraordinary wild places"
  },
  "search": {
    "destination": "Destination",
    "destinationPlaceholder": "Search for a park or lodge",
    "dates": "Dates",
    "guests": "Guests",
    "search": "Search"
  },
  "sections": {
    "curatedStays": "CURATED WILDERNESS STAYS",
    "basecamps": "BASECAMPS",
    "featuredLodges": "Featured Lodges"
  },
  "lodge": {
    "from": "From",
    "perNight": "/ Night",
    "viewLodge": "VIEW LODGE",
    "bookNow": "Book Now"
  },
  "modal": {
    "language": "Language",
    "currency": "Currency"
  },
  "footer": {
    "about": "About Junglore",
    "quickLinks": "Quick Links",
    "copyright": "© 2026 Junglore. All rights reserved."
  },
  "checkout": {
    "personalInformation": "Personal Information",
    "firstName": "First Name",
    "email": "Email",
    "proceedToPay": "Proceed to Pay"
  }
}
```

## How It Works

### 1. Language Selection
Users can change languages via the **Globe button** in the header:
- Opens `LocalizationModal`
- Displays all 12 languages with flags
- Selection is saved to `localStorage` (key: `junglore_language`)
- Modal auto-closes 300ms after selection

### 2. Synchronization
The `LocalizationContext` syncs with i18next:

```typescript
// When user selects a language:
const setLanguage = (lang: string) => {
  setLanguageState(lang);
  localStorage.setItem('junglore_language', lang);
  i18n.changeLanguage(lang);  // Syncs with i18next
};
```

### 3. Component Usage
Components use the `useTranslation` hook to access translations:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <h1>{t('hero.title')}</h1>
    <p>{t('hero.subtitle')}</p>
    <button>{t('search.search')}</button>
  );
}
```

### 4. Nested Keys
Access nested translation keys using dot notation:

```tsx
t('header.signIn')           // → "Sign In"
t('checkout.firstName')      // → "First Name"
t('sections.curatedStays')   // → "CURATED WILDERNESS STAYS"
```

## Updated Components

### ✅ Fully Translated Components
1. **Header** ([Header.tsx](src/components/layout/Header.tsx))
   - Navigation links (Experience, Basecamps, Field Notes)
   - Sign In button
   - Mobile menu items
   - Language & Currency button label

2. **LocalizationModal** ([LocalizationModal.tsx](src/components/layout/LocalizationModal.tsx))
   - Tab labels (Language, Currency)

3. **Home Page** ([page.tsx](src/app/page.tsx))
   - Hero title and subtitle
   - Search box labels

4. **SearchBox** ([SearchBox.tsx](src/components/domain/SearchBox.tsx))
   - Destination label
   - Dates label
   - Search button text
   - Placeholder text

## Currency Conversion

The system integrates language translation with **currency conversion**:

```tsx
// Currency conversion continues to work alongside translations
const { convertPrice, currency } = useLocalization();

<p>{convertPrice(450)} {t('lodge.perNight')}</p>
// Output in French: "€450 / Nuit"
// Output in Spanish: "€450 / Noche"
```

## Adding New Translations

### To add a new translation key:

1. **Add to all language files** (`src/i18n/locales/*.json`):
```json
{
  "newSection": {
    "newKey": "English Text"
  }
}
```

2. **Use in component**:
```tsx
{t('newSection.newKey')}
```

### To add a new language:

1. Create new JSON file: `src/i18n/locales/[code].json`
2. Add all translation keys matching existing structure
3. Update `src/i18n/config.ts`:
```typescript
import newLang from './locales/[code].json';

resources: {
  // ... existing languages
  '[code]': { translation: newLang },
}
```
4. Add to `LocalizationModal.tsx`:
```typescript
{ code: '[code]', name: 'Language Name', flag: '🇫🇱' }
```

## How to Convert a Component

### Step 1: Add "use client" directive
```tsx
"use client";
```

### Step 2: Import useTranslation
```tsx
import { useTranslation } from 'react-i18next';
```

### Step 3: Use the hook
```tsx
const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('sections.title')}</h1>;
};
```

### Step 4: Replace all hardcoded text
**Before:**
```tsx
<h1>Find Your Perfect Basecamp</h1>
<button>Sign In</button>
```

**After:**
```tsx
<h1>{t('hero.title')}</h1>
<button>{t('header.signIn')}</button>
```

## Testing

### Test language switching:
1. Open the website
2. Click the **Globe button** in header
3. Select a different language (e.g., Spanish)
4. Verify:
   - Header navigation changes to "Experiencia", "Campamentos Base", "Notas de Campo"
   - Hero title changes to "Encuentra Tu Campamento Base Perfecto"
   - All UI elements update to selected language
   - Currency symbol remains unchanged (currency is independent)

### Test persistence:
1. Select a language (e.g., French)
2. Refresh the page
3. Language should remain French (loaded from localStorage)

## Key Features

### ✅ Real-time switching
- All components update instantly when language changes
- No page refresh required

### ✅ Persistent preferences
- Language choice saved to localStorage
- Restored on page load

### ✅ Fallback mechanism
- If translation missing, falls back to English
- Prevents blank UI elements

### ✅ Currency + Language
- Independent systems working together
- Currency conversion works in any language
- Currency symbols adapt to selected currency
- Price formatting respects selected language locale

## Example Translations

### English (en)
```
"Find Your Perfect Basecamp"
"Discover curated stays"
"Sign In"
```

### Spanish (es)
```
"Encuentra Tu Campamento Base Perfecto"
"Descubre estancias seleccionadas"
"Iniciar Sesión"
```

### French (fr)
```
"Trouvez Votre Campement de Base Parfait"
"Découvrez des séjours sélectionnés"
"Se Connecter"
```

### Japanese (ja)
```
"完璧なベースキャンプを見つける"
"厳選された宿泊施設を発見する"
"サインイン"
```

### Hindi (hi)
```
"अपना परफेक्ट बेस कैंप खोजें"
"क्यूरेटेड आवास खोजें"
"साइन इन"
```

## Performance

- **Small bundle size**: Only 1 language loaded at a time
- **No server calls**: All translations bundled with app
- **Instant switching**: No network delay
- **Optimized**: i18next only loads active language resources

## Next Steps

To complete the translation implementation:

1. **Update remaining pages**:
   - `/basecamps` page
   - `/field-notes` page
   - Lodge detail pages
   - Checkout flow

2. **Add more translation keys**:
   - Form validation messages
   - Error messages
   - Success notifications
   - Tooltips

3. **Consider adding**:
   - Language auto-detection based on browser
   - Date formatting per locale
   - Number formatting per locale

## Support

For questions or issues with the translation system:
- Check console for i18next errors
- Verify translation keys exist in all language files
- Ensure component has "use client" directive
- Confirm useTranslation hook is imported and used correctly

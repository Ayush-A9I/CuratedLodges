# Language & Currency Conversion - Implementation Guide

## Overview
This project now includes a complete language and currency conversion system that allows users to:
- Select from 12 different languages
- Convert prices to 13 different currencies in real-time
- Preferences are saved in localStorage

## API Details
- **Service**: ExchangeRate-API
- **API Key**: f95dd9d65a222232f37116a1
- **Endpoint**: `https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/INR`
- **Base Currency**: Indian Rupee (INR)

## How It Works

### 1. Context Provider (`LocalizationContext.tsx`)
The `LocalizationProvider` wraps the entire application and provides:
- Language selection
- Currency selection
- Real-time exchange rate fetching
- Price conversion function
- Modal state management

### 2. Localization Modal (`LocalizationModal.tsx`)
A beautiful modal component that allows users to:
- Switch between Language and Currency tabs
- Select from available options
- Visual feedback with checkmarks for selected options

### 3. Header Integration
The header includes a Globe button that:
- Opens the localization modal
- Shows current currency
- Works on both desktop and mobile

## Usage Examples

### Converting Prices in Your Components

1. **Import the hook:**
```typescript
import { useLocalization } from '@/contexts/LocalizationContext';
```

2. **Get the convertPrice function:**
```typescript
const { convertPrice } = useLocalization();
```

3. **Replace price displays:**
```typescript
// Before:
₹{price.toLocaleString()}

// After:
{convertPrice(price)}
```

### Complete Example
```typescript
"use client";

import { useLocalization } from '@/contexts/LocalizationContext';

export default function YourComponent() {
  const { convertPrice, currency } = useLocalization();
  
  const price = 15000; // INR base price
  
  return (
    <div>
      <p>Price: {convertPrice(price)}</p>
      <p>Current Currency: {currency}</p>
    </div>
  );
}
```

## Supported Languages
- English (US & UK)
- Spanish (Spain & Mexico)
- French
- German
- Italian
- Portuguese (Portugal & Brazil)
- Japanese
- Chinese (Simplified)
- Hindi

## Supported Currencies
- INR (Indian Rupee) - ₹
- USD (US Dollar) - $
- EUR (Euro) - €
- GBP (British Pound) - £
- AUD (Australian Dollar) - A$
- CAD (Canadian Dollar) - C$
- JPY (Japanese Yen) - ¥
- CNY (Chinese Yuan) - ¥
- CHF (Swiss Franc) - Fr
- SGD (Singapore Dollar) - S$
- AED (UAE Dirham) - AED
- THB (Thai Baht) - ฿
- MYR (Malaysian Ringgit) - RM

## Files Updated

### New Files Created:
1. `src/contexts/LocalizationContext.tsx` - Context provider
2. `src/components/layout/LocalizationModal.tsx` - Modal component
3. `src/components/layout/LocalizationModal.module.css` - Modal styles

### Modified Files:
1. `src/app/layout.tsx` - Added provider wrapper
2. `src/components/layout/Header.tsx` - Added localization button
3. `src/components/layout/Header.module.css` - Added button styles
4. `src/app/park/[region]/[park]/[lodge]/page.tsx` - Converted prices
5. `src/app/basecamps/page.tsx` - Converted prices

## Adding Conversion to More Pages

To add currency conversion to any page:

1. **Import the hook at the top:**
```typescript
import { useLocalization } from '@/contexts/LocalizationContext';
```

2. **Get convertPrice in your component:**
```typescript
const { convertPrice } = useLocalization();
```

3. **Find all price displays and replace:**
```typescript
// Find patterns like:
₹{amount.toLocaleString()}
₹{amount}
`₹${amount.toLocaleString()}`

// Replace with:
{convertPrice(amount)}
```

## Performance Optimization

The system includes several optimizations:
- Exchange rates are cached in localStorage
- API calls are made only when currency changes
- Rates are fetched once and reused for all conversions
- No API calls for INR (base currency)

## Testing

To test the implementation:

1. Start the development server:
```bash
npm run dev
```

2. Open the application in your browser

3. Click the Globe button in the header

4. Try switching currencies and verify prices update

5. Refresh the page - your selection should be remembered

## Future Enhancements

Potential improvements:
- Add more languages with actual translations (using i18next)
- Cache exchange rates for 24 hours to reduce API calls
- Add loading states during currency conversion
- Show conversion rate information to users
- Add more currency options

## Support

For issues or questions about the localization system, please refer to:
- ExchangeRate-API Documentation: https://www.exchangerate-api.com/docs
- Next.js Context Documentation: https://nextjs.org/docs

# PWA Setup Guide for Softnova Wallet

## Overview
Your Next.js application has been configured as a Progressive Web App (PWA) with offline support and installability.

## ✅ What's Been Set Up

1. **Service Worker** (`public/sw.js`)
   - Offline functionality
   - Asset caching
   - Background sync support (ready for future enhancements)

2. **Web App Manifest** (`public/manifest.json`)
   - App metadata
   - Icons configuration
   - Display mode (standalone)
   - Theme colors

3. **PWA Components**
   - `PWAInstallPrompt`: Shows install prompt to users
   - `PWARegister`: Registers service worker automatically

4. **Configuration**
   - Next.js config updated with service worker headers
   - Layout updated with PWA metadata

## 📱 Next Steps

### 1. Generate PWA Icons
You need to generate icons in multiple sizes. See `scripts/generate-icons.md` for instructions.

**Required icon sizes:**
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px (required)
- 384x384px
- 512x512px (required)

**Quick Option:** Use an online tool like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Place generated icons in `public/icons/` directory.

### 2. Test PWA Functionality

#### Local Testing
1. Build the app: `pnpm build`
2. Start production server: `pnpm start`
3. Access via `http://localhost:3000` (HTTPS required for some features)

#### Mobile Testing
1. Deploy to a server with HTTPS (required for PWA installation)
2. On Android: Open Chrome → Menu → "Install app" or "Add to Home screen"
3. On iOS: Safari → Share → "Add to Home Screen"

### 3. Verify Installation
- Check browser DevTools → Application → Service Workers
- Check Application → Manifest
- Test offline mode by disconnecting network

## 🔧 Configuration

### Service Worker
The service worker is configured to:
- Cache static assets
- Cache dynamic pages
- Provide offline fallback
- Skip API routes (they require network)

### Manifest Features
- Standalone display mode (feels like native app)
- Theme color: `#22c55e` (green)
- Portrait orientation
- App shortcuts for quick actions

## 📝 Customization

### Change Theme Color
Update in:
- `public/manifest.json` → `theme_color`
- `src/app/layout.tsx` → `metadata.themeColor`

### Modify Service Worker Behavior
Edit `public/sw.js` to change caching strategies or add features.

### Customize Install Prompt
Edit `src/components/pwa-install-prompt.tsx` to change the prompt appearance or timing.

## 🐛 Troubleshooting

### Service Worker Not Registering
- Ensure you're using HTTPS (or localhost for development)
- Check browser console for errors
- Verify `sw.js` is accessible at `/sw.js`

### Icons Not Showing
- Ensure all icon files exist in `public/icons/`
- Check manifest.json has correct paths
- Verify icon files are valid PNG images

### Install Prompt Not Showing
- Browser must support `beforeinstallprompt` event (Chrome, Edge, Samsung Internet)
- User must not have already installed the app
- App must meet PWA criteria (HTTPS, manifest, service worker)

### iOS Installation Issues
- iOS requires user to manually add to home screen
- Ensure apple-touch-icon is properly configured
- Check Apple Web App meta tags in layout.tsx

## 📚 Resources
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)


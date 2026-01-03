# PWA Icon Generation Guide

To generate PWA icons, you can use one of these methods:

## Option 1: Using Online Tools (Recommended)
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your logo (Logo_.png or logo.png from the public folder)
3. Generate icons for all sizes
4. Download and extract the icons
5. Place them in `public/icons/` with these filenames:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

## Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
cd public
mkdir -p icons
convert logo.png -resize 72x72 icons/icon-72x72.png
convert logo.png -resize 96x96 icons/icon-96x96.png
convert logo.png -resize 128x128 icons/icon-128x128.png
convert logo.png -resize 144x144 icons/icon-144x144.png
convert logo.png -resize 152x152 icons/icon-152x152.png
convert logo.png -resize 192x192 icons/icon-192x192.png
convert logo.png -resize 384x384 icons/icon-384x384.png
convert logo.png -resize 512x512 icons/icon-512x512.png
```

## Option 3: Using Node.js Script
You can create a simple script using `sharp` package:

```bash
pnpm add -D sharp
```

Then create a script to generate all icons at once.

## Important Notes
- Icons should be square (same width and height)
- Use PNG format with transparency
- Ensure icons are optimized (use tools like TinyPNG after generation)
- The 192x192 and 512x512 sizes are most important for PWA installation


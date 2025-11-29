# Paradise Mediterranean Cuisine

Pixel-accurate recreation of the **Paradise Cuisine UI Project** Figma frame.

## Stack

- HTML5
- CSS3
- Vanilla JavaScript

## Getting Started

```bash
npm install    # (optional) installs serve/live-server if missing
npm run dev    # launches live-server on http://localhost:3000
# or
npm run start  # serves the static build with npx serve
```

## Assets

- `assets/images/hero-image.png` (hero frame export)
- `assets/images/menu-image-1.png` … `menu-image-5.png` (menu gallery exports)

## Structure

- `index.html` – semantic layout that mirrors the Figma home frame
- `menu.html` – dedicated menu page reproduced from the Menu frame
- `styles.css` – gradients, typography (Island Moments, IM FELL Great Primer SC, Inter), spacing, and contact band colors from Figma
- `script.js` – smooth scrolling for internal anchors

## Design Notes

- Header uses the cyan gradient bar with red stroke seen in Figma.
- Hero typography: eyebrow copy in Inter, headline in IM FELL Great Primer SC with matching drop shadow.
- CTA cards reproduce the MENU and Our Location tiles (blue + brown with gold stroke).
- Contact band background set to the same deep brown `#371C1C`.
- Menu page uses the same gradient nav, Island Moments heading, gallery column, deal banner, and Add to Cart pills shown in the menu frame.

Refer to the original designs for further tweaks:
- Home: [Paradise Cuisine UI Project](https://www.figma.com/design/GCtZA4FqPCR5D4mtEifJm0/Paradise-Cuisine-UI-Project?node-id=1-6&t=ZfSLgEpA3xPJyUHD-1)
- Menu: [Paradise Cuisine UI Project – Menu](https://www.figma.com/design/GCtZA4FqPCR5D4mtEifJm0/Paradise-Cuisine-UI-Project?node-id=6-4&t=ZfSLgEpA3xPJyUHD-4)


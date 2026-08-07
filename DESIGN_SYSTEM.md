# 🎨 Aetheria Design System Guidelines

Inspired by Linear, Raycast, Vercel, and Stripe, the Aetheria Design System balances restrained visual elegance with delightful micro-interactions.

---

## 📐 Typography & Hierarchy

- **Font Family**: Inter (Sans) & JetBrains Mono (Monospace)
- **Display / Hero**: `36px` (`2.25rem`), `font-weight: 800`, `letter-spacing: -0.03em`
- **Page Title**: `28px` (`1.75rem`), `font-weight: 700`, `letter-spacing: -0.02em`
- **Section Title**: `20px` (`1.25rem`), `font-weight: 600`, `letter-spacing: -0.01em`
- **Card Header**: `16px` (`1.0rem`), `font-weight: 600`
- **Body Text**: `14px` (`0.875rem`), `font-weight: 400`, `line-height: 1.6`
- **Caption / Mono Badge**: `12px` (`0.75rem`), `font-weight: 500`

---

## 📏 8px Spacing Scale

| Token | Pixels | Usage |
| :--- | :--- | :--- |
| `space-xs` | `4px` | Badge padding, micro gaps |
| `space-sm` | `8px` | Button padding, icon spacing |
| `space-md` | `16px` | Card internal padding, grid gaps |
| `space-lg` | `24px` | Section margins, container padding |
| `space-xl` | `32px` | Large layout gaps |
| `space-2xl` | `48px` | Hero section margins |

---

## ⚡ Motion & Physics Rules

- **Micro-Hover (`150ms`)**: Buttons, navigation links, icon highlights.
- **Card Lift (`200ms`)**: `transform: translateY(-2px)`, border color transition to `border-border-light`.
- **Modal Popup (`250ms`)**: Spring physics `damping: 25, stiffness: 300`.
- **Drawer Slide (`300ms`)**: Spring physics `damping: 30, stiffness: 280`.
- **Page Route Transition (`350ms`)**: Framer Motion `AnimatePresence` fade & subtle slide.

---

## 🎨 Theme Palette Suite

1. **Midnight (Linear Zinc)** — Dark Zinc backdrop `#09090B`, Royal Blue primary `#2563EB`.
2. **Aurora Indigo** — Slate backdrop `#0F172A`, Indigo primary `#6366F1`.
3. **Graphite OLED** — Pure Black backdrop `#000000`, Rose primary `#E11D48`.
4. **Ocean Deep** — Deep Sea Navy `#071626`, Cyan primary `#06B6D4`.
5. **Forest Emerald** — Emerald Dark `#061A14`, Emerald primary `#10B981`.
6. **Light Minimal** — Clean minimal white backdrop `#FFFFFF`, Zinc text.

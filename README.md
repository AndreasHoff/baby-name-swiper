# Baby Name Swiper App 👶❤️

## ✨ Description
A playful, mobile-friendly app for swiping through baby names and sorting them into categories: "Yes", "No", and "Favorite". Built for expecting parents to have fun picking names together.

## 🧠 Core Features
- **Swipable name cards** (boy/girl/unisex) in the center of the screen. Swipe functionality is implemented using Framer Motion for smooth drag gestures and touch support on mobile.
- Three colorful buttons below each card:
  - Left: ❌ "No"
  - Middle: ⭐ "Favorite"
  - Right: ✅ "Yes"
- Add custom names manually with gender selection.
- Automatically shuffle and show only *unvoted* cards on app load.
- View all names categorized by vote status in a list view.

## 🌍 Name Data
Uses a mock dataset of Danish/Scandinavian names. You can swap in your own JSON or connect to an API.

## 🧰 Tech Stack
- **React** with **Vite**
- **Tailwind CSS** for styling (via CDN)
- **Zustand** for local state management
- **Framer Motion** for swipe/touch animations
- **Firebase** (optional, for database/auth)

## 🧩 Architecture
- `CardStack`: Swipable stack of names (drag to vote)
- `SwipeButtons`: Vote buttons
- `NameForm`: Form to add custom names
- `NameListView`: Shows categorized names
- Zustand store for UI & vote state

## 🚀 Getting Started
1. Clone the repo
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open [http://localhost:5000](http://localhost:5000) in your browser

---

> **Note:** The app is fully responsive and optimized for mobile (max-width 430px). Swiping works with both touch and mouse. The swipe gesture is a true drag-to-vote experience: drag left for "No", right for "Yes".

# Baby Name Swiper App 👶❤️

## ✨ Desc### 📌 Feature Ideas & Feedback for the Name App - Version 2 (Mille feedback)

- [x] ~~Implement support for **unisex names**~~ ✅ COMPLETED
- [x] Add an **undo function** (in case a swipe or choice was made by mistake) ✅ COMPLETED  
- [x] ~~Improve the **swipe experience** (smoother and more intuitive)~~ ✅ COMPLETED
- [ ] When adding a name and selecting a specific gender, the selected gender should **persist** — it should **not revert to the default**, so the user doesn't need to switch back manually each time
- [ ] Allow users to **link to an article/database/website** — the app should intelligently detect and extract names from the link and suggest them individually
- [ ] Enable **data collection** so the developer can view statistics on the **types of names users add**
- [ ] Possibly introduce **categories** for names, such as:
  - Traditional Danish names
  - Nordic names
  - Modern names
  - Names usable in both Danish and Englishayful, mobile-friendly app for swiping through baby names and sorting them into categories: "Yes", "No", and "Favorite". Built for expecting parents to have fun picking names together.

## 🧠 Core Features
- **Swipable name cards** (boy/girl/unisex) in the center of the screen. Swipe functionality is implemented using Framer Motion for smooth drag gestures and touch support on mobile.
- **Gender filtering** - Toggle between All, Boys, Girls, or Unisex names without leaving the main view.
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


### 📌 Feature Ideas & Feedback for the Name App - Version 2 (Mille feedback)

- [ ] Implement support for **unisex names**
- [ ] Add an **undo function** (in case a swipe or choice was made by mistake)
- [ ] Improve the **swipe experience** (smoother and more intuitive)
- [ ] When adding a name and selecting a specific gender, the selected gender should **persist** — it should **not revert to the default**, so the user doesn’t need to switch back manually each time
- [ ] Allow users to **link to an article/database/website** — the app should intelligently detect and extract names from the link and suggest them individually
- [ ] Enable **data collection** so the developer can view statistics on the **types of names users add**
- [ ] Possibly introduce **categories** for names, such as:
  - Traditional Danish names
  - Nordic names
  - Modern names
  - Names usable in both Danish and English

----------- 

Version 3.0

## 📱 Feature & Product Inspiration: Review of Competing Baby Name App

While building this app, inspiration was drawn from a review of a competing app described as a "Tinder-style baby name app." The review highlights key successes and pain points, which helped guide our own priorities for UX, data structure, and functionality.

### ✅ What Worked in the Reviewed App
- **Tinder-style swiping**: Swiping right for potential names, left for rejects — a fast, fun way to browse.
- **Matching logic**: Shows when both partners liked the same name.
- **Independent selection**: Allows users to swipe separately, avoiding bias from the partner.
- **Occasional helpful results**: Helped couples discover 10–20 new name options they hadn't previously considered.
- **Name meanings and origin included**: Extra context made some unusual names more palatable.

### ❌ What Didn’t Work
- **Too many obscure names**: Users were overwhelmed by irrelevant or outdated names (e.g., Theodorus, Folkert).
- **Poor filtering**: Only allowed single-letter or single-nationality filtering at a time.
- **Low-quality name descriptions**: Celebrity bios and fun facts were often poorly written or nonsensical.
- **Unclear category filters**: Categories like "hipster" were inconsistently applied and unhelpful.
- **Overall fatigue**: Users reported swiping through hundreds of names with little return.

---

## 🧠 What We’re Doing Differently

This app was designed around real-world feedback and our personal journey as future parents. The core improvements over competing apps include:

### 🔄 Swiping Logic
- **Horizontal drag gestures**: Swipe left for "No", swipe right for "Yes"
- **Button voting**: Use the star button for "Favorite" votes
- Smooth animations and haptic feedback for all interactions

### 🧩 Smarter Filtering
- Filters can be **combined** (e.g. Nordic + Boy + Starts with A).
- Future categories: 
  - Modern
  - Old Danish
  - Nordic
  - English-friendly
  - Unisex

### 📚 Name Data
- Better curated name list with relevant, popular Scandinavian names.
- Each name will include:
  - Gender
  - Meaning (optional in early versions)
  - Country of origin (optional)
  - Popularity tier or frequency (eventually)

### 🛠️ Clean UX
- Names will be presented in a focused, scrollable stack.
- Avoiding info overload by keeping the name pool lean and relevant.
- Polished UI copy and simple, playful interactions.
- Playful feedback examples:
  - “You’re one swipe closer to your perfect name.”
  - “Not feeling Theodorus? We get it.”

---

## 🔮 Roadmap Items (inspired by competitor research)

| Priority | Feature | Notes |
|---------|---------|-------|
| ⭐️⭐️⭐️ | Stackable filtering | Combine letter + gender + category |
| ✅ | Swipe animations | ✅ COMPLETED: Horizontal drag gestures with visual feedback |
| ⭐️⭐️ | Name details | Short, helpful fields (origin, meaning) |
| ⭐️⭐️ | Name categories | Enable toggle between curated types |
| ⭐️ | User-submitted lists | Paste external list → auto-parse suggested names |
| ⭐️ | Matched list sharing | Export or share matched names with your partner |
| ⭐️ | UX polish | Improved animations, spacing, responsiveness |

---

> This project is continuously evolving based on feedback, inspiration from similar platforms, and real-world testing. Our goal is to provide couples with a clean, personal, and joyful experience as they find the perfect name together.
---

> **Note:** The app is fully responsive and optimized for mobile (max-width 430px). Swiping works with both touch and mouse. Horizontal drag gestures work for "Yes" (right) and "No" (left), while "Favorite" is accessible via the star button.

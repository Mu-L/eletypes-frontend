# Ele types

<img width="1000" alt="Screen Shot 2022-08-28 at 9 15 36 AM" src="https://user-images.githubusercontent.com/39578778/187084111-97d69aa7-53e4-46b9-b156-3ecc4d180d08.png">

## [www.eletypes.com](https://www.eletypes.com) ![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/gamer-ai/eletype-frontend?include_prereleases) ![GitHub stars](https://img.shields.io/github/stars/gamer-ai/eletype-frontend?style=social) ![GitHub forks](https://img.shields.io/github/forks/gamer-ai/eletype-frontend?style=social)

An elegant, open-source typing test tool. No sign-up required — all data tracked locally.

> Typing rules and interactions inspired by the famous [monkeytype.com](https://www.monkeytype.com);

> Built with React 18 + Vite, with a Supabase backend for the leaderboard.


## Feature Requests / Issues / Bug Reports

[![GitHub issues](https://img.shields.io/github/issues/gamer-ai/eletype-frontend)](https://github.com/gamer-ai/eletype-frontend/issues)

https://github.com/gamer-ai/eletype-frontend/issues

## Community Channel:

![Discord](https://img.shields.io/discord/993567075589181621?style=for-the-badge)

To join the community, please go to the website and hit "discord" icon.

## Current Features:

#### 1. Typing Test (words, sentence)

  - words mode
    - Eng Hard: Random blogs Words data source
    - Eng Normal: Top 1000 most frequent used English words
    - CHN Pinyin Hard: Chinese top 1500 idioms
    - CHN Pinyin Normal: Chinese top 5000 words/char
    - support four tests duration 90s, 60s, 30s, 15s
    - + Numbers: add random numbers from 0-99 at the end of the regenerated word
    - + Symbols: add random symbols at the end of the regenerated words
  - Sentence mode
    - CHN: Random chinese short sentences
    - ENG: Random English short sentences
    - Support three sentences count setting: 5, 10, 15
  - Stats:
    - WPM
    - KPM
    - Accuracy
    - Error analysis (correct/error/missing/extra chars count)
    - Visualizations
  - Anonymous Leaderboard (per mode combination):
    - Top 50 scores ranked by WPM (accuracy as tiebreaker)
    - One entry per user per mode — only personal best is kept
    - No sign-up required — uses browser fingerprint + localStorage identity
    - Submit score after completing a typing session
    - Browse leaderboards via the footer nav icon
    - Anti-cheat via FingerprintJS
  - Pacing Style (word pulse / smooth caret):
    - Pulse mode: the active word will have an underline pulse, which helps improve the speed typing habit.
    - Caret mode: a smooth animated caret that glides between characters with CSS transitions — Monkeytype-style.
  - Challenge Links:
    - Copy a challenge link after completing a test — friends who open the link type the exact same words
    - Deterministic word generation via seeded RNG
    - URL encodes seed + language + difficulty + timer + addons
  - Share Results:
    - Share button captures your stats as an image (html2canvas)
    - Share modal with copy to clipboard, download PNG, native share (mobile)
    - Social media buttons: X, Discord, WhatsApp, Telegram, LinkedIn, Weibo, WeChat
    - Native share with image attachment for WhatsApp/Telegram on mobile

#### 2. Words Card (for English learners)
This word card mode has further two types **Vocab Mode** and **Selective Mode**.
- **`Vocab Mode`** 
  - Vocabulary Source
    - GRE vocab
    - TOEFL
    - CET6
    - CET4
  - Multi Chapters Selection
  - Words Card Navigation UI
  - Recite Mode (word visibility off while phrase shown)
- **`Selective Mode`**
  - Provide focused typing practice with selected keys.
  - Enables targeted improvement.
  - Can practicing keys from the `home-row`, `top-row`, and `bottom-row`, either individually or in any combination, based on learning needs.

  
#### 3. Markdown Editor (`/markdown`) — *New*

 - Side-by-side markdown editor with live preview
 - Three view modes: Editor, Split, Preview
 - Syntax highlighting for code blocks (TypeScript, JavaScript, Python, etc.)
 - ASCII art "ELE TYPES" banner (responsive — compact on mobile)
 - Save as `.md` file
 - Typing sound support
 - Standalone route with minimal bottom nav

#### 4. Keyboard Lab (`/keyboardlab`) — *Beta*

 - 3D keyboard design editor — design custom keyboards in your browser
 - 6 layouts: 60%, 65%, 75%, TKL, Full-size, Cyberboard R2
 - 8 keycap profiles: Cherry, OEM, SA, MT3, KAT, DSA, XDA, Low Profile
 - 5 shell presets: Standard, Slim, Wide Bezel, Angular, Top Heavy
 - Parametric case profile editor with 2D → 3D extrusion
 - Colored edge accent strips (LED-style glow)
 - Per-group opacity: keycap, accent, case, legend
 - 10 color themes with "le smoking" as default
 - 6 legend presets with live font/size/weight/color editing
 - Live key press animation with sound
 - Bidirectional JSON schema editor with Doc reference tab
 - Design save/load/export/import (eletypes-design-bundle/1 format)
 - Roadmap modal with editor's note
 - Full EN/ZH localization
 - See [KEYBOARD_LAB.md](src/components/features/KeyboardLab/KEYBOARD_LAB.md) for full documentation

#### 6. QWERTY Keyboard touch-typing trainer 

 - A QWERTY keyboard layout UI populating random key for touch typing with stats

#### 7. Spotify player

 - A spotify player 
 
#### 8. Themes Collection

- Static Themes

  - Dark
  - Tokyo night
  - Piano
  - Aluminum
  - Terminal (matrix inspired)
  - Cyber (cyberpunk inspired)
  - Steam (steampunk inspired)
  - Light
  - Nintendo
  - Araki Nobuyoshi
  - Hero
  - Budapest
  - Cool Kid
  - EdgeRunner (cyberpunk 2077 edgerunners episodes inspired)

- Dynamic Themes (WebGL based, may degrade performance. experimental feature. Component Library used from [UV canvas](https://uvcanvas.com/))

  - Tranquiluxe,
  - Lumiflex,
  - Opulento,
  - Velustro

![dynamicThemesDemo](https://github.com/gamer-ai/eletypes-frontend/assets/39578778/d716a287-6f59-4568-8276-1ee6b5f5850a)

  
#### 9. LocalStorage persist for essential settings

  - Browser refresh will bring back to the localStorage stored settings

#### 10. Focus Mode

  - move header to footer. 
  - hide the setting menu. leave only timer, wpm stats. 
  - If music enabled, a compact spotify will be put in footer.

#### 11. Ultra Zen Mode

![image](https://github.com/user-attachments/assets/ab3e7c94-4f38-4607-86aa-1cd3d8296381)

toggle ![image](https://github.com/user-attachments/assets/b552b444-f411-4a1d-a40a-981b05e3e59d) to use the ultra zen mode when in words mode. The ultra zen mode can auto highlight and auto dim while you are typing. 

 
#### 12. Typing Sound Effect

  - default: cherry blue switch
  - optional: keyboard (hard)
  - optional: typewriter (soft)
  
  <img width="120" alt="Screen Shot 2022-09-29 at 2 01 51 AM" src="https://user-images.githubusercontent.com/39578778/192989337-637e1154-fbca-420b-babb-22846d5dbdb1.png">
  
#### 13. [Tab] key to Fast redo/reset

  - [Tab] + [Space] for quickly redo
  - [Tab] + [Enter] / [Tab] + [Tab] for quickly reset
  - [Tab] + [Any Key] to exit the dialog

#### 14. Chinese / English UI (i18n)

  - Toggle between Chinese and English interface via the settings or profile menu
  - All tooltips, labels, stats, leaderboard text, and banners are translated
  - Preference persisted in localStorage

#### 15. Profile Menu

  - Accessible via the profile button (top-right corner), always visible including in focus mode
  - **Profile** — edit display name, view rank + badges (no sign-up required)
  - **Stats** — personal dashboard with:
    - Overview: best/avg effective WPM (WPM × Accuracy), average accuracy
    - Activity heatmap (3 months, GitHub-style)
    - WPM and accuracy consistency gauges
    - WPM trend chart with outlier detection (flags low-accuracy sessions)
    - Mode breakdown table
    - Session history per mode with filters, per-entry delete, and clear all
  - **Leaderboard** — browse global leaderboard from any mode (no need to finish a test first)
  - **Settings** — toggle switches for Focus Mode, Sound, Music, Ultra Zen, and Interface Language
  - **News** — view all announcements including previously dismissed banners

#### 16. Badge System

  - 33 badges across 6 categories: Speed, Effective Speed, Accuracy, Consistency, Explorer, Social
  - Speed badges based on raw WPM, Effective Speed badges based on WPM × Accuracy
  - Rank system (7 tiers from Membrane to Custom Build) based on best effective WPM
  - Hidden badges discoverable through gameplay
  - Badge notifications on unlock

#### 17. Progressive Web App (PWA)

  - Installable on desktop and mobile — works like a native app
  - Offline support via service worker (type without internet)
  - Auto-updates when new versions are deployed

#### 18. Words Card Auto-Play Audio

  - Auto-play pronunciation audio when navigating words in vocab mode
  - Toggle on/off next to the speaker button, persisted in localStorage
  - Defaults to on

### Some Themes

<img width="600" alt="EletypesThemes" src="https://user-images.githubusercontent.com/39578778/187084245-364b6c5f-97e4-42c9-a0c6-010505ad3283.png">

### Caps Lock Detection

<img width="400" alt="Screen Shot 2022-04-20 at 4 52 24 PM" src="https://user-images.githubusercontent.com/39578778/164343051-2de97570-fcec-49a4-893a-903afe94e5f4.png">

### Simplist typing stats is all your need

<img width="800" alt="Screen Shot 2022-08-28 at 9 24 55 AM" src="https://user-images.githubusercontent.com/39578778/187084372-a4d18d33-286e-4e7b-97d0-d069c7fd1d53.png">

### Words Card Demo

Regular Mode and Recite Mode

<img width="400" alt="Screen Shot 2022-08-23 at 12 47 53 AM" src="https://user-images.githubusercontent.com/39578778/186102023-7db8bfc2-f481-4a90-98c2-f47ad66c12cd.png"><img width="400" alt="Screen Shot 2022-08-23 at 12 48 22 AM" src="https://user-images.githubusercontent.com/39578778/186102059-cb7d43a4-a9d3-4728-90f9-2965038ed24c.png">

### QWERTY Touch-Typing Trainer Demo

<img width="800" alt="Screen Shot 2022-08-23 at 12 52 17 AM" src="https://user-images.githubusercontent.com/39578778/186102830-4c664e9a-adfa-48dc-ba8c-e03df4e22ade.png">


## For Devs

### Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key
3. Run the SQL in `supabase_migration.sql` in your Supabase SQL Editor to create the scores table

### `npm run dev`

Runs the app in development mode with Vite.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.\
Hot Module Replacement (HMR) enabled — changes reflect instantly.

### `npm run build`

Builds the app for production to the `build` folder using Vite.

### `npm run preview`

Serves the production build locally for testing.

### Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public API key |

For Netlify deploys, set these in **Site configuration > Environment variables**.

### Pull Requests

Create a branch with proper name example 'feat/your-cool-feature', create the pull request and add authors for reviews. Please include description with details.


## Sponsors

### Buy Me A Coffee:

https://www.buymeacoffee.com/daguozi

## Credits

Thanks [@rendi12345678](https://github.com/rendi12345678) for his continuous contributions and making the feature of data visualization for the typing stats!


## Roblox Game

Recently a Roblox game "Type!" was built on top of the Ele Types by [@WheelMakerStudio](https://www.roblox.com/users/10692403745/profile/) and expanded features such as leaderboards and battle modes. You can find it [here](https://www.roblox.com/games/89217440428554/Type).


<img width="800" height="600" alt="Screenshot 2026-03-23 at 11 13 27 PM" src="https://github.com/user-attachments/assets/ea36bc86-50c1-48c9-acea-7350e7f4669a" />




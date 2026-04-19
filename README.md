# Eletypes

> **An elegant, open-source typing test with anonymous leaderboards, badges, and a built-in 3D keyboard design lab.** No signup. No ads. Your history is local; leaderboard submissions are anonymous.

**🌐 [English](./README.md) · [中文](./README.zh-CN.md)**

[![Live](https://img.shields.io/badge/www-eletypes.com-6ec6ff)](https://www.eletypes.com)
![Release](https://img.shields.io/github/v/release/gamer-ai/eletype-frontend?include_prereleases)
![Stars](https://img.shields.io/github/stars/gamer-ai/eletype-frontend?style=social)
![Discord](https://img.shields.io/discord/993567075589181621)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)

<img width="1000" alt="Eletypes" src="https://user-images.githubusercontent.com/39578778/187084111-97d69aa7-53e4-46b9-b156-3ecc4d180d08.png" />

## Why Eletypes?

Warm up with a chill session, or go deep and design your own 3D keyboard — Eletypes stays clean and fast either way. Inspired by [monkeytype.com](https://www.monkeytype.com/), built on React 18 + Vite, with Supabase behind the leaderboard.

## Features

### Modes
- **Typing Test** — English & Chinese (Pinyin), words + sentence modes, 15/30/60/90s timers, +numbers / +symbols add-ons, pulse & caret pacing
- **Vocab Cards** — GRE, TOEFL, CET4/6; learn vocabulary by typing it
- **Markdown Editor** at `/markdown` — live preview, syntax highlighting, save as `.md`
- **Keyboard Lab** at `/keyboardlab` *(beta)* — design custom 3D keyboards in your browser: 7 layouts, 8 keycap profiles, parametric case editor, KLE import, full JSON schema. → [deep dive](src/components/features/KeyboardLab/KEYBOARD_LAB.md)
- **QWERTY Trainer** — touch-typing practice

### Social & Progress
- **Anonymous leaderboard** — top 50 WPM per mode; fingerprint identity; no signup
- **Badges & ranks** — 30+ achievements across speed, accuracy, consistency, exploration
- **Stats dashboard** — activity heatmap, WPM trend, outlier detection, session history
- **Challenge links** — deterministic seeded words; send friends the exact same test
- **Shareable result cards** — auto-rendered image for X / Discord / WhatsApp / LinkedIn / Weibo / WeChat

### Experience
- **18 themes** including dynamic WebGL backgrounds (Tranquiluxe, Lumiflex, Opulento, Velustro)
- **Typing sounds** — Cherry Blue, mechanical, typewriter
- **Focus / Ultra Zen** modes for distraction-free sessions
- **PWA** — installable, works offline
- **i18n** — full English & 中文 UI
- **Keyboard shortcuts** — `Tab+Space` redo · `Tab+Enter` restart

### Privacy
No accounts. No ads. No tracking. Your practice history and settings live in your browser's localStorage. The only data that leaves your device is anonymous leaderboard submissions — tagged by a browser fingerprint (no account, no PII) purely for anti-cheat and dedup.

## Quick Start

```bash
npm install
npm run dev      # localhost:3000
npm run build    # production bundle
npm run deploy   # Firebase Hosting
```

## Documentation

- [Keyboard Lab — architecture & roadmap](src/components/features/KeyboardLab/KEYBOARD_LAB.md)
- [Contributing with Claude / agent guide](CLAUDE.md)

## Community

- **Discord** — click the Discord icon in the app footer
- **[Issues & feature requests](https://github.com/gamer-ai/eletype-frontend/issues)**

## Credits

Huge thanks to [@rendi12345678](https://github.com/rendi12345678) for continuous contributions — including the data visualization for typing stats.

## Sponsor

If Eletypes helps you or just makes you smile, consider supporting development:

[☕ Buy Me A Coffee](https://www.buymeacoffee.com/daguozi)

## License

[GPL-3.0](LICENSE) — free to use, modify, and redistribute. Derivative works must remain open source under the same license.

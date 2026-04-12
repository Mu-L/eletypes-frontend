# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow

- Work autonomously to fulfill requested features.
- Create, modify, and delete files as necessary.
- Run tests (`npm test`, `pytest`, etc.) to verify changes.
- **DO NOT** ask for permission for file edits or running bash commands.
- **ONLY** ask for input when you are ready to create a `git commit` or if a test fails persistently.

### Commit Behavior

- After implementing a cohesive piece of logic, pause.
- Propose a `git commit` message.
- Wait for user approval before executing `git commit`.

### Code Review

- Before committing, run linters/tests.
- If errors occur, attempt to fix them autonomously.
- If stuck, present the code for review.

## Project Overview

Eletypes is a typing test web application built with React 18 and Vite. It offers multiple typing modes (word, sentence, free-type, keyboard trainer, vocabulary cards) with an extensive theming system.

## Commands

- **Dev server:** `npm run dev` or `npm start` (localhost:3000, Vite)
- **Build:** `npm run build` (Vite, outputs to `build/`)
- **Preview:** `npm run preview` (serve production build locally)
- **Deploy:** Firebase Hosting (`npm run deploy` runs build + firebase deploy)

## Architecture

### State Management

No Redux or Context API. All state lives in React hooks:
- `useLocalPersistState` (`src/hooks/useLocalPersistState.js`) — wraps `useState` + `useEffect` to sync state to localStorage. Used for all user preferences (theme, sound, mode selections).
- App-level state in `src/App.js` manages mode toggles (focusedMode, musicMode, coffeeMode, trainerMode, etc.) and passes them as props.

### Game Modes

Each mode has its own component in `src/components/features/`:
- **TypeBox/** — Core word-typing mode (~1200 lines). Handles countdown timer, WPM calculation, error tracking, pacing styles (pulse/caret).
- **SentenceBox/** — Sentence-typing mode with its own stats.
- **FreeTypingBox.js** — Coffee/free-type mode.
- **Keyboard/DefaultKeyboard.js** — QWERTY touch-typing trainer.
- **WordsCard/WordsCard.js** — Vocabulary flashcard mode (GRE, TOEFL, CET).

`App.js` conditionally renders the active mode component.

### Web Workers

Heavy calculations are offloaded to Web Workers in `src/worker/`:
- `calculateWpmWorker.js` / `calculateRawWpmWorker.js` — WPM formulas
- `trackCharsErrorsWorker.js` / `trackHistoryWorker.js` — error and history tracking

Instantiated in TypeBox via `new Worker(new URL(...))`.

### Theming

- 18 themes defined in `src/style/theme.js`. Each theme object has: `background`, `text`, `gradient`, `title`, `textTypeBox`, `stats`, `fontFamily`.
- 4 dynamic themes use WebGL backgrounds via the `uvcanvas` library, rendered by `DynamicBackground.js`.
- Applied via styled-components `ThemeProvider`. Global styles in `src/style/global.js`.

### Word/Sentence Generation

`src/scripts/` contains generators that pull from datasets in `src/constants/` (WordsMostCommon.js, SentencesCollection.js, DictionaryConstants.js).

### Styling

Material-UI (`@mui/material`) for UI components + styled-components for custom styling. No CSS modules or Tailwind.

### Keyboard Shortcuts

- **Tab + Space** — Redo current test
- **Tab + Enter** — Restart with new words

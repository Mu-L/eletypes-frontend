const HISTORY_KEY = "eletypes-score-history";
const MAX_ENTRIES = 10;

const getModeKey = ({ language, difficulty, duration, numberAddon, symbolAddon }) => {
  return `${language}|${difficulty}|${duration}|${numberAddon}|${symbolAddon}`;
};

const getAll = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
  } catch {
    return {};
  }
};

export const addScore = ({ wpm, accuracy, language, difficulty, duration, numberAddon, symbolAddon }) => {
  const all = getAll();
  const key = getModeKey({ language, difficulty, duration, numberAddon, symbolAddon });
  const entries = all[key] || [];
  entries.push({
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy * 100) / 100,
    date: new Date().toISOString(),
  });
  // Keep only the last MAX_ENTRIES
  all[key] = entries.slice(-MAX_ENTRIES);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
};

export const getScores = ({ language, difficulty, duration, numberAddon, symbolAddon }) => {
  const all = getAll();
  const key = getModeKey({ language, difficulty, duration, numberAddon, symbolAddon });
  return all[key] || [];
};

export const getAllScores = () => {
  const all = getAll();
  return Object.values(all).flat();
};

export const getTotalSessionCount = () => {
  return getAllScores().length;
};

export const getLanguagesPlayed = () => {
  const all = getAll();
  const languages = new Set();
  for (const key of Object.keys(all)) {
    if (all[key].length > 0) {
      languages.add(key.split("|")[0]);
    }
  }
  return languages;
};

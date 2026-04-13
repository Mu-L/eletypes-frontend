import { generateSeed } from "../scripts/seedUtils";

const PARAM_KEYS = {
  seed: "s",
  language: "l",
  difficulty: "d",
  timer: "t",
  number: "n",
  symbol: "sym",
};

export const createChallengeUrl = ({ seed, language, difficulty, timer, numberAddOn, symbolAddOn }) => {
  const params = new URLSearchParams();
  params.set(PARAM_KEYS.seed, seed);
  params.set(PARAM_KEYS.language, language === "CHINESE_MODE" ? "cn" : "en");
  params.set(PARAM_KEYS.difficulty, difficulty === "hard" ? "h" : "n");
  params.set(PARAM_KEYS.timer, String(timer));
  if (numberAddOn) params.set(PARAM_KEYS.number, "1");
  if (symbolAddOn) params.set(PARAM_KEYS.symbol, "1");
  return { url: `${window.location.origin}?${params.toString()}`, seed };
};

export const parseChallengeParams = () => {
  const params = new URLSearchParams(window.location.search);
  const seed = params.get(PARAM_KEYS.seed);
  if (!seed) return null;

  const langParam = params.get(PARAM_KEYS.language);
  const diffParam = params.get(PARAM_KEYS.difficulty);

  return {
    seed,
    language: langParam === "cn" ? "CHINESE_MODE" : "ENGLISH_MODE",
    difficulty: diffParam === "h" ? "hard" : "normal",
    timer: parseInt(params.get(PARAM_KEYS.timer) || "60", 10),
    numberAddOn: params.get(PARAM_KEYS.number) === "1",
    symbolAddOn: params.get(PARAM_KEYS.symbol) === "1",
  };
};

export const clearChallengeParams = () => {
  window.history.replaceState({}, "", window.location.pathname);
};

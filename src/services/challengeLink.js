import { generateSeed } from "../scripts/seedUtils";
import {
  CUSTOM_WORDS_KEY,
  CUSTOM_WORDS_ACTIVE_KEY,
  resolveActiveCustomList,
} from "../scripts/customWords";

const PARAM_KEYS = {
  seed: "s",
  language: "l",
  difficulty: "d",
  timer: "t",
  number: "n",
  symbol: "sym",
  wordList: "wl",
};

// Hard cap on payload size to keep URLs reasonable. ~4KB raw → ~5.5KB base64.
// Past this we just drop the wl param and the recipient falls back to the
// default word source for the chosen language.
const MAX_WORDLIST_PAYLOAD = 4000;

// URL-safe base64 (no padding). Used for the `wl` param payload.
const toBase64Url = (str) => {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (s) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return decodeURIComponent(escape(atob(b64)));
};

const readActiveListFromStorage = () => {
  try {
    const rawLists = window.localStorage.getItem(CUSTOM_WORDS_KEY);
    const rawActive = window.localStorage.getItem(CUSTOM_WORDS_ACTIVE_KEY);
    if (!rawLists || !rawActive) return null;
    const lists = JSON.parse(rawLists);
    const active = JSON.parse(rawActive);
    return resolveActiveCustomList(lists, active);
  } catch {
    return null;
  }
};

const encodeWordListPayload = (list) => {
  if (!list) return null;
  // Only ship the fields the recipient needs. Drop the local id — it gets
  // regenerated on the recipient side to avoid collisions. For Chinese we
  // include `resolved` so the recipient doesn't need pinyin-pro loaded.
  const payload = {
    n: list.name || "",
    l: list.language || "ENGLISH_MODE",
    t: typeof list.text === "string" ? list.text : "",
  };
  if (list.language === "CHINESE_MODE" && Array.isArray(list.resolved)) {
    payload.r = list.resolved;
  }
  const json = JSON.stringify(payload);
  if (json.length > MAX_WORDLIST_PAYLOAD) return null;
  return toBase64Url(json);
};

export const decodeWordListPayload = (encoded) => {
  if (!encoded) return null;
  try {
    const json = fromBase64Url(encoded);
    const data = JSON.parse(json);
    if (!data || typeof data.t !== "string") return null;
    return {
      name: typeof data.n === "string" && data.n.trim() ? data.n : "Shared list",
      language: data.l === "CHINESE_MODE" ? "CHINESE_MODE" : "ENGLISH_MODE",
      text: data.t,
      resolved: Array.isArray(data.r) ? data.r : null,
    };
  } catch {
    return null;
  }
};

export const createChallengeUrl = ({ seed, language, difficulty, timer, numberAddOn, symbolAddOn }) => {
  const params = new URLSearchParams();
  params.set(PARAM_KEYS.seed, seed);
  params.set(PARAM_KEYS.language, language === "CHINESE_MODE" ? "cn" : "en");
  params.set(PARAM_KEYS.difficulty, difficulty === "hard" ? "h" : "n");
  params.set(PARAM_KEYS.timer, String(timer));
  if (numberAddOn) params.set(PARAM_KEYS.number, "1");
  if (symbolAddOn) params.set(PARAM_KEYS.symbol, "1");

  // If a custom word list is active when sharing, embed it so the recipient
  // sees the exact same words. The list's language overrides the lang param
  // on the receiving side — see App.jsx initialChallenge handling.
  const activeList = readActiveListFromStorage();
  const encoded = encodeWordListPayload(activeList);
  if (encoded) params.set(PARAM_KEYS.wordList, encoded);

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
    wordList: decodeWordListPayload(params.get(PARAM_KEYS.wordList)),
  };
};

export const clearChallengeParams = () => {
  window.history.replaceState({}, "", window.location.pathname);
};

import { supabase } from "./supabase";
import { getFingerprint } from "./fingerprint";
import { getUserId } from "./userIdentity";

const SUBMIT_COOLDOWN_MS = 5000;
let lastSubmitTime = 0;

export const submitScore = async ({
  wpm,
  accuracy,
  userName,
  language,
  difficulty,
  duration,
  numberAddon,
  symbolAddon,
}) => {
  if (!supabase) return null;

  const now = Date.now();
  if (now - lastSubmitTime < SUBMIT_COOLDOWN_MS) {
    console.warn("Score submission rate limited");
    return null;
  }
  lastSubmitTime = now;

  const fingerprint = await getFingerprint();
  const userId = getUserId();
  const roundedWpm = Math.round(wpm);
  const roundedAccuracy = Math.round(accuracy * 100) / 100;

  // Check if user already has a record for this mode combination
  const { data: existing } = await supabase
    .from("scores")
    .select("id, wpm")
    .eq("fingerprint", fingerprint)
    .eq("language", language)
    .eq("difficulty", difficulty)
    .eq("duration", duration)
    .eq("number_addon", numberAddon)
    .eq("symbol_addon", symbolAddon)
    .single();

  if (existing) {
    // Only update if new score is better
    if (roundedWpm <= existing.wpm) {
      return { result: "no_improvement", previousBest: existing.wpm };
    }
    const { data, error } = await supabase
      .from("scores")
      .update({
        user_name: userName || "Anonymous",
        user_id: userId,
        wpm: roundedWpm,
        accuracy: roundedAccuracy,
        created_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select();

    if (error) {
      console.error("Score update error:", error);
      return null;
    }
    return { result: "improved", previousBest: existing.wpm };
  }

  // First submission for this mode
  const { data, error } = await supabase.from("scores").insert({
    user_id: userId,
    user_name: userName || "Anonymous",
    fingerprint,
    wpm: roundedWpm,
    accuracy: roundedAccuracy,
    language,
    difficulty,
    duration,
    number_addon: numberAddon,
    symbol_addon: symbolAddon,
  }).select();

  if (error) {
    console.error("Score submission error:", error);
    return null;
  }
  return { result: "new" };
};

export const fetchLeaderboard = async ({
  language,
  difficulty,
  duration,
  numberAddon,
  symbolAddon,
}) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("scores")
    .select("user_name, wpm, accuracy, created_at")
    .eq("language", language)
    .eq("difficulty", difficulty)
    .eq("duration", duration)
    .eq("number_addon", numberAddon)
    .eq("symbol_addon", symbolAddon)
    .order("wpm", { ascending: false })
    .order("accuracy", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Leaderboard fetch error:", error);
    return [];
  }
  return data;
};

export const fetchPlayerRank = async ({
  wpm,
  accuracy,
  language,
  difficulty,
  duration,
  numberAddon,
  symbolAddon,
}) => {
  if (!supabase) return null;

  const roundedWpm = Math.round(wpm);
  const roundedAccuracy = Math.round(accuracy * 100) / 100;

  // Count players with strictly higher WPM
  const { count: higherWpm, error: err1 } = await supabase
    .from("scores")
    .select("id", { count: "exact", head: true })
    .eq("language", language)
    .eq("difficulty", difficulty)
    .eq("duration", duration)
    .eq("number_addon", numberAddon)
    .eq("symbol_addon", symbolAddon)
    .gt("wpm", roundedWpm);

  // Count players with same WPM but higher accuracy
  const { count: sameWpmHigherAcc, error: err2 } = await supabase
    .from("scores")
    .select("id", { count: "exact", head: true })
    .eq("language", language)
    .eq("difficulty", difficulty)
    .eq("duration", duration)
    .eq("number_addon", numberAddon)
    .eq("symbol_addon", symbolAddon)
    .eq("wpm", roundedWpm)
    .gt("accuracy", roundedAccuracy);

  if (err1 || err2) {
    console.error("Rank fetch error:", err1 || err2);
    return null;
  }
  return higherWpm + sameWpmHigherAcc + 1;
};

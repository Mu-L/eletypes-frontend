import React, { useEffect, useState, useCallback } from "react";
import {
  fetchLeaderboard,
  fetchPlayerRank,
  submitScore,
} from "../../../services/leaderboard";
import { getUserName, setUserName } from "../../../services/userIdentity";
import { supabase } from "../../../services/supabase";
import ScoreHistoryPanel from "./ScoreHistoryPanel";

const TAB_LEADERBOARD = "leaderboard";
const TAB_HISTORY = "history";

const Leaderboard = ({
  wpm,
  accuracy,
  language,
  difficulty,
  duration,
  numberAddon,
  symbolAddon,
  theme,
}) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [playerRank, setPlayerRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [name, setName] = useState(() => getUserName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB_LEADERBOARD);

  const modeParams = {
    language,
    difficulty,
    duration,
    numberAddon,
    symbolAddon,
  };

  const loadLeaderboard = useCallback(async () => {
    const data = await fetchLeaderboard(modeParams);
    setLeaderboardData(data);
    const rank = await fetchPlayerRank({ wpm, accuracy, ...modeParams });
    setPlayerRank(rank);
    setLoading(false);
  }, [wpm, language, difficulty, duration, numberAddon, symbolAddon]);

  const handleSubmit = async () => {
    if (submitted) return;
    const displayName = name.trim() || "Anonymous";
    setUserName(displayName);
    setName(displayName);

    const response = await submitScore({
      wpm,
      accuracy,
      userName: displayName,
      ...modeParams,
    });
    setSubmitted(true);
    if (response?.result === "new") {
      setSubmitMessage("Score submitted!");
    } else if (response?.result === "improved") {
      setSubmitMessage(`New personal best! (previous: ${response.previousBest} WPM)`);
    } else if (response?.result === "no_improvement") {
      setSubmitMessage(`Your best is ${response.previousBest} WPM — keep going!`);
    }
    await loadLeaderboard();
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    loadLeaderboard();
  }, [loadLeaderboard]);

  const handleNameChange = (e) => {
    const val = e.target.value.slice(0, 20);
    setName(val);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (name.trim()) {
      setUserName(name.trim());
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
    e.stopPropagation();
  };

  const getModeLabel = () => {
    const lang = language === "ENGLISH_MODE" ? "eng" : "chn";
    const parts = [lang, difficulty, `${duration}s`];
    if (numberAddon) parts.push("+num");
    if (symbolAddon) parts.push("+sym");
    return parts.join(" · ");
  };

  const tabStyle = (isActive) => ({
    background: "transparent",
    border: "none",
    borderBottom: isActive ? `2px solid ${theme.stats}` : `2px solid transparent`,
    color: isActive ? theme.stats : theme.textTypeBox,
    padding: "6px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: theme.fontFamily,
    fontWeight: isActive ? 600 : 400,
    transition: "all 0.2s",
  });

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Tabs + mode label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          borderBottom: `1px solid ${theme.textTypeBox}30`,
        }}
      >
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            style={tabStyle(activeTab === TAB_LEADERBOARD)}
            onClick={() => setActiveTab(TAB_LEADERBOARD)}
          >
            Leaderboard
          </button>
          <button
            style={tabStyle(activeTab === TAB_HISTORY)}
            onClick={() => setActiveTab(TAB_HISTORY)}
          >
            Your History
          </button>
        </div>
        <span style={{ color: theme.textTypeBox, fontSize: "13px", paddingBottom: "6px" }}>
          {getModeLabel()}
          {submitted && playerRank && activeTab === TAB_LEADERBOARD && (
            <span style={{ color: theme.stats, marginLeft: "8px" }}>
              #{playerRank} {submitMessage && `· ${submitMessage}`}
            </span>
          )}
        </span>
      </div>

      {/* Leaderboard tab */}
      {activeTab === TAB_LEADERBOARD && (
        <>
          {!submitted && supabase && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "12px",
                alignItems: "center",
              }}
            >
              {isEditingName ? (
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  maxLength={20}
                  placeholder="Your name"
                  style={{
                    background: "transparent",
                    border: `1px solid ${theme.textTypeBox}`,
                    borderRadius: "4px",
                    color: theme.text,
                    padding: "6px 10px",
                    fontSize: "14px",
                    fontFamily: theme.fontFamily,
                    outline: "none",
                    width: "160px",
                  }}
                />
              ) : (
                <span
                  onClick={() => setIsEditingName(true)}
                  style={{
                    color: name ? theme.text : theme.textTypeBox,
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: "6px 10px",
                    border: `1px solid transparent`,
                    borderBottom: `1px dashed ${theme.textTypeBox}`,
                  }}
                >
                  {name || "Click to set name"}
                </span>
              )}
              <button
                onClick={handleSubmit}
                style={{
                  background: "transparent",
                  border: `1px solid ${theme.stats}`,
                  borderRadius: "4px",
                  color: theme.stats,
                  padding: "6px 16px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: theme.fontFamily,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                Submit Score
              </button>
            </div>
          )}

          {!supabase ? (
            <p style={{ color: theme.textTypeBox, fontSize: "14px" }}>
              Leaderboard unavailable.
            </p>
          ) : loading ? (
            <p style={{ color: theme.textTypeBox, fontSize: "14px" }}>
              Loading leaderboard...
            </p>
          ) : leaderboardData.length === 0 ? (
            <p style={{ color: theme.textTypeBox, fontSize: "14px" }}>
              No scores yet. Be the first!
            </p>
          ) : (
            <div
              style={{
                maxHeight: "240px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: `${theme.stats} transparent`,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      color: theme.textTypeBox,
                      borderBottom: `1px solid ${theme.textTypeBox}`,
                    }}
                  >
                    <th style={{ textAlign: "left", padding: "6px 8px" }}>#</th>
                    <th style={{ textAlign: "left", padding: "6px 8px" }}>Name</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>WPM</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>ACC</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry, idx) => (
                    <tr
                      key={idx}
                      style={{
                        color: idx < 3 ? theme.stats : theme.text,
                        borderBottom: `1px solid ${theme.textTypeBox}33`,
                      }}
                    >
                      <td style={{ padding: "5px 8px" }}>
                        {idx === 0
                          ? "1st"
                          : idx === 1
                          ? "2nd"
                          : idx === 2
                          ? "3rd"
                          : `${idx + 1}th`}
                      </td>
                      <td style={{ padding: "5px 8px" }}>{entry.user_name}</td>
                      <td style={{ textAlign: "right", padding: "5px 8px" }}>
                        {entry.wpm}
                      </td>
                      <td style={{ textAlign: "right", padding: "5px 8px" }}>
                        {Math.round(entry.accuracy)}%
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          padding: "5px 8px",
                          color: theme.textTypeBox,
                          fontSize: "12px",
                        }}
                      >
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* History tab */}
      {activeTab === TAB_HISTORY && (
        <ScoreHistoryPanel
          language={language}
          difficulty={difficulty}
          duration={duration}
          numberAddon={numberAddon}
          symbolAddon={symbolAddon}
          theme={theme}
        />
      )}
    </div>
  );
};

export default Leaderboard;

import React from "react";
import {
  Line,
  YAxis,
  Tooltip as TooltipChart,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { getScores } from "../../../services/scoreHistory";

const ScoreHistoryPanel = ({ language, difficulty, duration, numberAddon, symbolAddon, theme }) => {
  const scores = getScores({ language, difficulty, duration, numberAddon, symbolAddon });

  if (scores.length === 0) {
    return (
      <p style={{ color: theme.textTypeBox, fontSize: "14px" }}>
        No history yet. Complete a session to start tracking.
      </p>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <span style={{ color: theme.textTypeBox, fontSize: "13px" }}>
          last {scores.length} session{scores.length !== 1 ? "s" : ""}
        </span>
        <div style={{ fontSize: "13px", color: theme.textTypeBox, display: "flex", gap: "16px" }}>
          <span>
            best:{" "}
            <span style={{ color: theme.stats }}>
              {Math.max(...scores.map((s) => s.wpm))} WPM
            </span>
          </span>
          <span>
            avg:{" "}
            <span style={{ color: theme.text }}>
              {Math.round(scores.reduce((a, b) => a + b.wpm, 0) / scores.length)} WPM
            </span>
          </span>
        </div>
      </div>
      {scores.length > 1 && (
        <ResponsiveContainer width="100%" height={100}>
          <ComposedChart
            data={scores}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <Line
              type="monotone"
              dataKey="wpm"
              stroke={theme.text}
              dot={{ r: 3, fill: theme.stats }}
              strokeWidth={1.5}
            />
            <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
            <TooltipChart
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div
                      style={{
                        background: theme.background,
                        border: `1px solid ${theme.textTypeBox}`,
                        padding: "4px 8px",
                        fontSize: "12px",
                        opacity: 0.9,
                      }}
                    >
                      <div>{d.wpm} WPM</div>
                      <div>{d.accuracy}% ACC</div>
                      <div style={{ color: theme.textTypeBox }}>
                        {new Date(d.date).toLocaleDateString()}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", marginTop: "8px" }}>
        <thead>
          <tr style={{ color: theme.textTypeBox, borderBottom: `1px solid ${theme.textTypeBox}` }}>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>#</th>
            <th style={{ textAlign: "right", padding: "6px 8px" }}>WPM</th>
            <th style={{ textAlign: "right", padding: "6px 8px" }}>ACC</th>
            <th style={{ textAlign: "right", padding: "6px 8px" }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {[...scores].reverse().map((entry, idx) => (
            <tr
              key={idx}
              style={{
                color: idx === 0 ? theme.stats : theme.text,
                borderBottom: `1px solid ${theme.textTypeBox}33`,
              }}
            >
              <td style={{ padding: "5px 8px" }}>{scores.length - idx}</td>
              <td style={{ textAlign: "right", padding: "5px 8px" }}>{entry.wpm}</td>
              <td style={{ textAlign: "right", padding: "5px 8px" }}>{Math.round(entry.accuracy)}%</td>
              <td style={{ textAlign: "right", padding: "5px 8px", color: theme.textTypeBox, fontSize: "12px" }}>
                {new Date(entry.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreHistoryPanel;

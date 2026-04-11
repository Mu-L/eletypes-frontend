import React, { memo, useMemo } from "react";
import {
  Line,
  YAxis,
  Tooltip as TooltipChart,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { getScores } from "../../../services/scoreHistory";
import { useLocale } from "../../../context/LocaleContext";

const ScoreHistoryPanel = ({ language, difficulty, duration, numberAddon, symbolAddon, theme }) => {
  const { t } = useLocale();
  const scores = useMemo(
    () => getScores({ language, difficulty, duration, numberAddon, symbolAddon }),
    [language, difficulty, duration, numberAddon, symbolAddon]
  );

  if (scores.length === 0) {
    return (
      <p style={{ color: theme.textTypeBox, fontSize: "14px" }}>
        {t("no_history")}
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
          {scores.length === 1 ? t("last_session") : t("last_sessions", scores.length)}
        </span>
        <div style={{ fontSize: "13px", color: theme.textTypeBox, display: "flex", gap: "16px" }}>
          <span>
            {t("best")}:{" "}
            <span style={{ color: theme.stats }}>
              {Math.max(...scores.map((s) => s.wpm))} WPM
            </span>
          </span>
          <span>
            {t("avg")}:{" "}
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
            <th style={{ textAlign: "left", padding: "6px 8px" }}>{t("rank_header")}</th>
            <th style={{ textAlign: "right", padding: "6px 8px" }}>WPM</th>
            <th style={{ textAlign: "right", padding: "6px 8px" }}>ACC</th>
            <th style={{ textAlign: "right", padding: "6px 8px" }}>{t("date_header")}</th>
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

export default memo(ScoreHistoryPanel);

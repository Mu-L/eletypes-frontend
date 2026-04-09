import React, { useEffect, useState, useMemo } from "react";
import { Tooltip } from "@mui/material";
import { CHAR_TOOLTIP_TITLE } from "../../../constants/Constants";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as TooltipChart,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";
import { red } from "@mui/material/colors";
import Leaderboard from "../Leaderboard/Leaderboard";
import { addScore, getScores } from "../../../services/scoreHistory";

const Stats = ({
  status,
  wpm,
  countDown,
  countDownConstant,
  statsCharCount,
  language,
  rawKeyStrokes,
  theme,
  renderResetButton,
  setIncorrectCharsCount,
  incorrectCharsCount,
  difficulty,
  numberAddon,
  symbolAddon,
}) => {
  const [roundedRawWpm, setRoundedRawWpm] = useState(0);
  const roundedWpm = Math.round(wpm);

  useEffect(() => {
    const worker = new Worker(
      new URL("../../../worker/calculateRawWpmWorker", import.meta.url)
    );

    worker.postMessage({ rawKeyStrokes, countDownConstant, countDown });

    worker.onmessage = function (e) {
      setRoundedRawWpm(e.data);
      worker.terminate();
    };

    return () => worker.terminate();
  }, [rawKeyStrokes, countDownConstant, countDown]);

  const initialTypingTestHistory = [
    {
      wpm: 0,
      rawWpm: 0,
      time: 0,
      error: 0,
    },
  ];

  const [typingTestHistory, setTypingTestHistory] = useState(
    initialTypingTestHistory
  );

  const accuracy = Math.round(statsCharCount[0]);

  const data = typingTestHistory.map((history) => ({
    wpm: history.wpm,
    rawWpm: history.rawWpm,
    time: history.time,
    error: history.error,
  }));

  useEffect(() => {
    if (status === "started") {
      setTypingTestHistory(initialTypingTestHistory);
    }
  }, [status]);

  useEffect(() => {
    if (status === "started" && countDown < countDownConstant) {
      const worker = new Worker(
        new URL("../../../worker/trackHistoryWorker", import.meta.url)
      );

      worker.postMessage({
        countDown,
        countDownConstant,
        typingTestHistory,
        roundedWpm,
        roundedRawWpm,
        incorrectCharsCount,
      });

      worker.onmessage = function (e) {
        const { newEntry, resetErrors } = e.data;
        setTypingTestHistory((prevTypingTestHistory) => [
          ...prevTypingTestHistory,
          newEntry,
        ]);

        if (resetErrors) {
          setIncorrectCharsCount(0);
        }
      };

      // Clean up the worker on component unmount
      return () => worker.terminate();
    }
  }, [countDown]);

  const modeParams = useMemo(
    () => ({
      language,
      difficulty,
      duration: countDownConstant,
      numberAddon,
      symbolAddon,
    }),
    [language, difficulty, countDownConstant, numberAddon, symbolAddon]
  );

  // Save score to local history when session finishes
  const [historySaved, setHistorySaved] = useState(false);
  useEffect(() => {
    if (status === "finished" && !historySaved && data.length > 1) {
      const totalWpm = data.map((e) => e.wpm).reduce((a, b) => a + b, 0);
      const avgWpm = totalWpm / (data.length - 1);
      addScore({ wpm: avgWpm, accuracy, ...modeParams });
      setHistorySaved(true);
    }
    if (status === "started") {
      setHistorySaved(false);
    }
  }, [status, historySaved, data, accuracy, modeParams]);

  const scoreHistory = useMemo(
    () => (status === "finished" ? getScores(modeParams) : []),
    [status, modeParams, historySaved]
  );

  const getFormattedLanguageLanguageName = (value) => {
    switch (value) {
      case "ENGLISH_MODE":
        return "eng";
      case "CHINESE_MODE":
        return "chn";
      default:
        return "eng";
    }
  };

  const renderCharStats = () => (
    <Tooltip
      title={
        <span style={{ whiteSpace: "pre-line" }}>{CHAR_TOOLTIP_TITLE}</span>
      }
    >
      <div>
        <p className="stats-title">Characters</p>
        <h2 className="stats-value">
          <span className="correct-char-stats">{statsCharCount[1]}</span>/
          <span className="incorrect-char-stats">{statsCharCount[2]}</span>/
          <span className="missing-char-stats">{statsCharCount[3]}</span>/
          <span className="correct-char-stats">{statsCharCount[4]}</span>/
          <span className="incorrect-char-stats">{statsCharCount[5]}</span>
        </h2>
      </div>
    </Tooltip>
  );

  const renderIndicator = (color) => (
    <span
      style={{ backgroundColor: color, height: "12px", width: "24px" }}
    ></span>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const payloadData = payload[0].payload;
      return (
        <div
          className="custom-tooltip"
          style={{
            paddingInline: "8px",
            paddingBlock: "2px",
          }}
        >
          <p className="label" style={{ fontSize: "12px", fontWeight: "bold" }}>
            {`Time: ${label} s`}
          </p>
          <p className="desc tooltip">
            {renderIndicator(red[400])}
            {`Errors: ${payloadData.error}`}
          </p>
          <p className="desc tooltip">
            {renderIndicator(theme.textTypeBox)}
            {`Raw WPM: ${payloadData.rawWpm}`}
          </p>
          <p className="desc tooltip">
            {renderIndicator(theme.text)}
            {`WPM: ${payloadData.wpm}`}
          </p>
        </div>
      );
    }

    return null;
  };

  const renderAccuracy = () => (
    <div style={{ marginTop: "16px" }}>
      <h2 className="primary-stats-title">ACC</h2>
      <h1 className="primary-stats-value">{accuracy}%</h1>
    </div>
  );

  const renderRawKpm = () => (
    <div>
      <p className="stats-title">KPM</p>
      <h2 className="stats-value">
        {Math.round((rawKeyStrokes / Math.max(countDownConstant, 1)) * 60.0)}
      </h2>
    </div>
  );

  const renderLanguage = () => (
    <div>
      <p className="stats-title">Test Mode</p>
      <h2 className="stats-value">
        {getFormattedLanguageLanguageName(language)}
      </h2>
    </div>
  );

  const renderTime = () => (
    <div>
      <p className="stats-title">Time</p>
      <h2 className="stats-value">{countDownConstant} s</h2>
    </div>
  );

  const renderWpm = () => {
    const totalWpm = data.map((e) => e.wpm).reduce((a, b) => a + b, 0);
    const averageWpm = data.length > 1 ? totalWpm / (data.length - 1) : 0;
    return (
      <div>
        <h2 className="primary-stats-title">WPM</h2>
        <h1 className="primary-stats-value">{Math.round(averageWpm)}</h1>
      </div>
    );
  };

  const Chart = () => (
    <ResponsiveContainer
      width="100%"
      minHeight={200}
      maxHeight={200}
      height="100%"
    >
      <ComposedChart
        width="100%"
        height="100%"
        data={data.filter((d) => d.time !== 0)}
        margin={{
          top: 12,
          right: 12,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid
          vertical={false}
          horizontal={false}
          stroke={theme.text}
          opacity={0.15}
        />
        <XAxis
          dataKey="time"
          stroke={theme.text}
          tickMargin={10}
          opacity={0.25}
        />
        <YAxis stroke={theme.text} tickMargin={10} opacity={0.25} />
        <TooltipChart cursor content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="rawWpm"
          stroke={theme.textTypeBox}
          dot={false}
          activeDot={false}
        />
        <Line
          type="monotone"
          dataKey="wpm"
          stroke={theme.text}
          dot={false}
          activeDot={false}
        />
        <Bar dataKey="error" barSize={12} fill={`${red[400]}`} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <>
      {status !== "finished" && (
        <>
          <h3>{countDown} s</h3>
          <h3>WPM: {Math.round(wpm)}</h3>
        </>
      )}

      {status === "finished" && (
        <div className="stats-overlay">
          <section className="stats-chart">
            <section className="stats-header">
              <div>
                {renderWpm()}
                {renderAccuracy()}
              </div>
              {Chart()}
            </section>
            <section className="stats-footer">
              {renderLanguage()}
              {renderRawKpm()}
              {renderCharStats()}
              {renderTime()}
            </section>
            <section>{renderResetButton()}</section>
            {scoreHistory.length > 1 && (
              <section style={{ marginTop: "8px" }}>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "16px",
                    color: theme.text,
                    fontWeight: 400,
                  }}
                >
                  Your History{" "}
                  <span
                    style={{
                      color: theme.textTypeBox,
                      fontSize: "13px",
                    }}
                  >
                    last {scoreHistory.length} sessions
                  </span>
                </h3>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
                  <ResponsiveContainer width="100%" height={80}>
                    <ComposedChart
                      data={scoreHistory}
                      margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                      <Line
                        type="monotone"
                        dataKey="wpm"
                        stroke={theme.text}
                        dot={{ r: 2, fill: theme.stats }}
                        strokeWidth={1.5}
                      />
                      <YAxis
                        hide
                        domain={["dataMin - 5", "dataMax + 5"]}
                      />
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
                  <div style={{ fontSize: "12px", color: theme.textTypeBox, whiteSpace: "nowrap" }}>
                    <div>
                      best:{" "}
                      <span style={{ color: theme.stats }}>
                        {Math.max(...scoreHistory.map((s) => s.wpm))} WPM
                      </span>
                    </div>
                    <div>
                      avg:{" "}
                      <span style={{ color: theme.text }}>
                        {Math.round(
                          scoreHistory.reduce((a, b) => a + b.wpm, 0) /
                            scoreHistory.length
                        )}{" "}
                        WPM
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}
            <Leaderboard
              wpm={
                data.length > 1
                  ? Math.round(
                      data.map((e) => e.wpm).reduce((a, b) => a + b, 0) /
                        (data.length - 1)
                    )
                  : 0
              }
              accuracy={accuracy}
              language={language}
              difficulty={difficulty}
              duration={countDownConstant}
              numberAddon={numberAddon}
              symbolAddon={symbolAddon}
              theme={theme}
            />
          </section>
        </div>
      )}
    </>
  );
};

export default Stats;

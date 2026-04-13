import React, { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import ShareModal from "./ShareModal";
import { useLocale } from "../../../context/LocaleContext";

const ShareButton = ({ targetRef, theme, label }) => {
  const { t } = useLocale();
  const [imageData, setImageData] = useState(null);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    if (!targetRef?.current) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: theme.background,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Add watermark
      const ctx = canvas.getContext("2d");
      ctx.font = "14px sans-serif";
      ctx.fillStyle = theme.textTypeBox;
      ctx.globalAlpha = 0.5;
      ctx.fillText("eletypes.com", canvas.width - 120, canvas.height - 12);
      ctx.globalAlpha = 1;

      setImageData(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Share capture failed:", err);
    }
    setCapturing(false);
  }, [targetRef, theme]);

  return (
    <>
      <button
        onClick={handleCapture}
        disabled={capturing}
        style={{
          background: "transparent",
          border: `1px solid ${theme.stats}`,
          borderRadius: "4px",
          color: theme.stats,
          padding: "4px 12px",
          cursor: capturing ? "wait" : "pointer",
          fontSize: "13px",
          fontFamily: theme.fontFamily,
          opacity: capturing ? 0.5 : 1,
        }}
      >
        {capturing ? "..." : label || t("share_button")}
      </button>
      {imageData && (
        <ShareModal
          imageData={imageData}
          theme={theme}
          onClose={() => setImageData(null)}
        />
      )}
    </>
  );
};

export default ShareButton;

import { useEffect, useMemo, useState } from "react";

function HeroTitle({
  segments = [
    { text: "Fueling the " },
    { text: "Future", className: "text-gradient" },
    { text: " of Youth Football" },
  ],
  speed = 45, 
  pauseAfter = 800, 
}) {
  const totalLength = useMemo(
    () => segments.reduce((acc, s) => acc + (s.text?.length || 0), 0),
    [segments]
  );

  const [charsTyped, setCharsTyped] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let interval = null;
    if (charsTyped < totalLength) {
      interval = setInterval(() => {
        setCharsTyped((c) => c + 1);
      }, speed);
    } else {

      setDone(true);
      const t = setTimeout(() => {
      }, pauseAfter);
      return () => clearTimeout(t);
    }
    return () => clearInterval(interval);
  }, [charsTyped, totalLength, speed, pauseAfter]);
  let remaining = charsTyped;
  const rendered = segments.map((seg, idx) => {
    const segText = seg.text || "";
    if (remaining <= 0) return { html: "", className: seg.className || "" };
    const take = Math.min(segText.length, remaining);
    const html = segText.slice(0, take);
    remaining -= take;
    return { html, className: seg.className || "" };
  });

  return (
    <h1
      className="text-5xl md:text-6xl font-extrabold text-green-600 glowing-text mb-4 leading-tight"
      aria-live="polite"
    >
      {rendered.map((r, i) => (
        <span key={i} className={r.className}>
          {r.html}
        </span>
      ))}
      <span
        className={`inline-block ml-1 w-[10px] h-[1.05em] align-bottom ${
          done ? "typing-caret-done" : "typing-caret"
        }`}
        aria-hidden="true"
      />
    </h1>
  );
}

export default HeroTitle
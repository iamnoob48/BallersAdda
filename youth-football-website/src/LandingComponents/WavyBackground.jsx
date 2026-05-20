import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className = "",
  containerClassName = "",
  colors,
  waveWidth,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  origin = "bottom-left",
  ...props
}) => {
  const noise = createNoise3D();
  let w, h, nt, ctx, canvas;
  const canvasRef = useRef(null);
  const animationId = useRef(null);

  const getSpeed = () => {
    switch (speed) {
      case "slow": return 0.00015;
      case "fast": return 0.0004;
      default: return 0.00015;
    }
  };

  const getRotation = () => {
    switch (origin) {
      case "bottom-left": return -Math.PI / 5;
      case "center": return 0;
      default: return -Math.PI / 5;
    }
  };

  const init = () => {
    canvas = canvasRef.current;
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    nt = 0;

    const onResize = () => {
      if (!ctx) return;
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    render();
    return () => window.removeEventListener("resize", onResize);
  };

  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ];

  const drawWave = (n) => {
    nt += getSpeed();
    const rotation = getRotation();

    ctx.save();

    if (origin === "bottom-left") {
      ctx.translate(w * 0.3, h * 0.7);
    } else {
      ctx.translate(w / 2, h / 2);
    }
    ctx.rotate(rotation);

    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 120;
      ctx.strokeStyle = waveColors[i % waveColors.length];

      const spread = w * 2;
      for (let x = -spread; x < spread; x += 5) {
        const y = noise(x / 800, 0.3 * i, nt) * 200 + (i - n / 2) * 80;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.closePath();
    }

    ctx.restore();
  };

  const render = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.filter = `blur(${blur}px)`;
    ctx.globalAlpha = waveOpacity;
    drawWave(5);
    animationId.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    const cleanup = init();
    return () => {
      cancelAnimationFrame(animationId.current);
      if (cleanup) cleanup();
    };
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
      navigator.userAgent.includes("Safari") &&
      !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center ${containerClassName}`}>
      <canvas
        className="absolute inset-0 z-10 pointer-events-none"
        ref={canvasRef}
        id="canvas"
        style={isSafari ? {} : undefined}
      />
      <div className={`relative z-20 ${className}`} {...props}>
        {children}
      </div>
    </div>
  );
};

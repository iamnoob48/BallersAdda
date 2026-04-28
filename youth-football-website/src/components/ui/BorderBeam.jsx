import { motion } from "framer-motion";

const BorderBeam = ({
  className = "",
  wrapperClassName = "",
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border-transparent ${wrapperClassName}`}
      style={{
        borderWidth: `${borderWidth}px`,
        borderStyle: "solid",
        WebkitMask:
          "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        WebkitMaskComposite: "destination-in",
        mask: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        maskComposite: "intersect",
        WebkitMaskClip: "padding-box, border-box",
        maskClip: "padding-box, border-box",
      }}
    >
      <motion.div
        className={`absolute aspect-square ${className}`}
        style={{
          width: size,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
        }}
      />
    </div>
  );
};

export default BorderBeam;

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import lottie from "lottie-web";

const cache = new Map<string, object>();

interface NotoEmojiProps {
  codepoint: string;
  size?: number;
  isSelected?: boolean;
  onClick?: () => void;
  label?: string;
  color?: string;
  hoverPlay?: boolean;
  static?: boolean;
}

export function NotoEmoji({
  codepoint,
  size = 48,
  isSelected,
  onClick,
  label,
  color,
  hoverPlay = true,
  static: isStatic = false,
}: NotoEmojiProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<{
    destroy: () => void;
    play: () => void;
    stop: () => void;
    goToAndStop: (v: number, b: boolean) => void;
    loop: boolean | number;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [animData, setAnimData] = useState<object | null>(null);

  useEffect(() => {
    const cached = cache.get(codepoint);
    if (cached) {
      setAnimData(cached);
      return;
    }

    let cancelled = false;
    fetch(`https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/lottie.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data: object) => {
        if (!cancelled) {
          cache.set(codepoint, data);
          setAnimData(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [codepoint]);

  useEffect(() => {
    if (!containerRef.current || !animData) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData: animData,
    });

    animRef.current = anim;

    return () => {
      anim.destroy();
      animRef.current = null;
    };
  }, [animData]);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim || isStatic) return;

    if (isHovered && hoverPlay) {
      anim.loop = true;
      anim.play();
    } else {
      anim.loop = false;
      anim.stop();
      anim.goToAndStop(0, true);
    }
  }, [isHovered, hoverPlay, isStatic]);

  const handleHoverStart = useCallback(() => setIsHovered(true), []);
  const handleHoverEnd = useCallback(() => setIsHovered(false), []);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border cursor-pointer select-none transition-colors duration-100 ${
        isSelected
          ? `${color || "bg-primary/10 border-primary/20"} ring-2 ring-primary/20`
          : "border-border hover:bg-muted/50"
      }`}
    >
      <div ref={containerRef} style={{ width: size, height: size }} />
      {label && (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
    </motion.button>
  );
}

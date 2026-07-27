import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import lottie from "lottie-web";

const cache = new Map<string, object>();

interface NotoEmojiProps {
  codepoint: string;
  size?: number;
  isSelected?: boolean;
  hasSelection?: boolean;
  onClick?: () => void;
  label?: string;
  static?: boolean;
}

export function NotoEmoji({
  codepoint,
  size = 48,
  isSelected,
  hasSelection,
  onClick,
  label,
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

    anim.loop = true;
    anim.play();
  }, [animData, isStatic]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      animate={isSelected ? { scale: 1.15, opacity: 1 } : { scale: 1, opacity: hasSelection ? 0.4 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-1.5 cursor-pointer select-none outline-none rounded-xl px-1"
    >
      <div ref={containerRef} style={{ width: size, height: size }} />
      {label && (
        <span className={`text-[10px] font-medium transition-colors duration-200 ${
          isSelected ? "text-foreground" : "text-muted-foreground/40"
        }`}>
          {label}
        </span>
      )}
    </motion.button>
  );
}

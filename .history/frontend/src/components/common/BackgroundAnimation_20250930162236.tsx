// src/components/common/LottieBackground.tsx
import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";
import "./BackgroundAnimation.css";

type LottieBackgroundProps = {
  /** Path to the Lottie JSON. Defaults to /animations/bg.json */
  src?: string;
  /** Optional: slow down animation (1 = normal). Defaults to 1. */
  speed?: number;
  /** Optional: extra class for custom theming */
  className?: string;
};

export default function LottieBackground({
  src = "/animations/bg.json",
  speed = 1,
  className = "",
}: LottieBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let anim: AnimationItem | null = null;

    if (containerRef.current) {
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: !prefersReduced,
        path: src, // served from public/
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
          progressiveLoad: true,
          hideOnTransparent: true,
        },
      });

      anim.setSpeed(Math.max(0.1, speed));

      // Pause when tab is not visible to save CPU
      const onVisibility = () => {
        if (!anim) return;
        if (document.hidden) anim.pause();
        else if (!prefersReduced) anim.play();
      };
      document.addEventListener("visibilitychange", onVisibility);

      // If reduced motion, stop at first frame
      if (prefersReduced) {
        anim.addEventListener("DOMLoaded", () => {
          anim?.goToAndStop(0, true);
        });
      }

      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        anim?.destroy();
      };
    }
  }, [src, speed]);

  return <div className={`lottie-bg ${className}`} aria-hidden="true" ref={containerRef} />;
}

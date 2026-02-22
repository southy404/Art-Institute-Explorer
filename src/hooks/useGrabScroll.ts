import { useRef, useEffect, useCallback, useState } from "react";

export function useGrabScroll() {
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  // Callback-Ref: wird aufgerufen sobald das DOM-Element wirklich da ist
  const ref = useCallback((node: HTMLDivElement | null) => {
    setEl(node);
  }, []);

  useEffect(() => {
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDown.current = true;
      isDragging.current = false;
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
      el.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    };

    const onMouseUp = () => {
      if (!isDown.current) return;
      isDown.current = false;
      el.style.cursor = "grab";
      document.body.style.userSelect = "";
      setTimeout(() => {
        isDragging.current = false;
      }, 50);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      if (Math.abs(walk) > 5) isDragging.current = true;
      el.scrollLeft = scrollLeft.current - walk;
    };

    const onClickCapture = (e: MouseEvent) => {
      if (isDragging.current) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("click", onClickCapture, true);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove, { passive: false });

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      document.body.style.userSelect = "";
    };
  }, [el]); // ← läuft neu wenn el sich ändert, also sobald das DOM-Element da ist

  return { ref, isDragging };
}

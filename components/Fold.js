"use client";
import { useEffect, useRef, useState } from "react";

/* A native <details> that keeps its content in the server-rendered HTML (so it stays
   indexable and works without JS) but starts collapsed to shorten the page.
   It opens itself when the URL hash points at something inside it (e.g. /#wine-truth-title),
   and optionally on wide screens where length is not a problem. */
export default function Fold({ title, hint, openOnWide = false, id, children }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reveal = () => {
      const hash = decodeURIComponent(window.location.hash || "").slice(1);
      if (!hash || !ref.current) return;
      const target = document.getElementById(hash);
      if (target && ref.current.contains(target)) {
        setOpen(true);
        requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
      }
    };
    if (openOnWide && window.matchMedia("(min-width: 861px)").matches) setOpen(true);
    reveal();
    window.addEventListener("hashchange", reveal);
    const beforePrint = () => setOpen(true);
    window.addEventListener("beforeprint", beforePrint);
    return () => {
      window.removeEventListener("hashchange", reveal);
      window.removeEventListener("beforeprint", beforePrint);
    };
  }, [openOnWide]);

  return (
    <details
      ref={ref}
      id={id}
      className="home-fold"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        <span className="home-fold-title">{title}</span>
        {hint ? <span className="home-fold-hint">{hint}</span> : null}
      </summary>
      <div className="home-fold-body">{children}</div>
    </details>
  );
}

"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "poet_banner_v1";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="relative z-[600] bg-ink py-2.5 pl-4 pr-10 text-center text-[12.5px] font-medium tracking-[0.06em] text-paper">
      Free shipping on orders over $150&nbsp;·&nbsp;Easy returns within 30 days
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[18px] leading-none opacity-50 transition-opacity hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

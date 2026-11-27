"use client";

import { useEffect } from "react";

import { useStudio } from "@/store/useStudio";

import { LeftSidebar } from "./LeftSidebar";
import { PaywallModal } from "./PaywallModal";
import { PrintReport } from "./PrintReport";
import { RightSidebar } from "./RightSidebar";
import { Topbar } from "./Topbar";
import { UploadModal } from "./UploadModal";
import { Viewport } from "./Viewport";

function isTyping(t: EventTarget | null) {
  return t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

function useGlobalShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const st = useStudio.getState();
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") {
        e.preventDefault();
        if (e.shiftKey) st.redo();
        else st.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && k === "y") {
        e.preventDefault();
        st.redo();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const sel = st.selection;
      if (k === "r" && sel?.kind === "furniture") {
        e.preventDefault();
        st.rotateFurniture(sel.id, e.shiftKey ? -Math.PI / 4 : Math.PI / 4);
      } else if ((k === "delete" || k === "backspace") && sel?.kind === "furniture") {
        e.preventDefault();
        st.deleteFurniture(sel.id);
      } else if (k === "escape") {
        st.select(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function Toast() {
  const toast = useStudio((s) => s.toast);
  const show = useStudio((s) => s.showToast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => show(null), 3200);
    return () => clearTimeout(t);
  }, [toast, show]);
  if (!toast) return null;
  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/15 bg-black/85 px-4 py-2 text-[13px] shadow-xl backdrop-blur"
    >
      {toast}
    </div>
  );
}

export function StudioApp() {
  useGlobalShortcuts();
  return (
    <>
      <div id="app-root" className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
        <Topbar />
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <LeftSidebar />
          <Viewport />
          <RightSidebar />
        </div>
        <UploadModal />
        <PaywallModal />
        <Toast />
      </div>
      <PrintReport />
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { getCoursePackSectionForPage } from "../components/coursepack/coursePackSections";

const STORAGE_KEY = "coursePackViewerState";

function readStoredState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function useCoursePackState() {
  const stored = readStoredState();
  const [bookmarks, setBookmarks] = useState(
    Array.isArray(stored?.bookmarks) ? stored.bookmarks.filter(Number.isFinite) : []
  );
  const [recentPages, setRecentPages] = useState(
    Array.isArray(stored?.recentPages) ? stored.recentPages.filter(Number.isFinite) : []
  );
  const [savedPage, setSavedPage] = useState(Number.isFinite(stored?.page) ? stored.page : 1);
  const [savedZoom, setSavedZoom] = useState(Number.isFinite(stored?.zoom) ? stored.zoom : 1);
  const [savedSectionId, setSavedSectionId] = useState(
    typeof stored?.sectionId === "string" ? stored.sectionId : getCoursePackSectionForPage(savedPage)?.id || null
  );
  const [savedSectionPage, setSavedSectionPage] = useState(
    Number.isFinite(stored?.sectionPage) ? stored.sectionPage : 1
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = {
      page: savedPage,
      zoom: savedZoom,
      sectionId: savedSectionId,
      sectionPage: savedSectionPage,
      bookmarks,
      recentPages,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [bookmarks, recentPages, savedPage, savedSectionId, savedSectionPage, savedZoom]);

  const hasSavedProgress = useMemo(
    () => savedPage > 1 || bookmarks.length > 0 || recentPages.length > 0 || savedZoom !== 1,
    [bookmarks.length, recentPages.length, savedPage, savedZoom]
  );

  function toggleBookmark(page) {
    setBookmarks((current) =>
      current.includes(page)
        ? current.filter((item) => item !== page)
        : [...current, page].sort((a, b) => a - b)
    );
  }

  function recordRecentPage(page) {
    if (!Number.isFinite(page)) return;
    setRecentPages((current) => [page, ...current.filter((item) => item !== page)].slice(0, 6));
  }

  return {
    bookmarks,
    recentPages,
    savedPage,
    savedZoom,
    savedSectionId,
    savedSectionPage,
    hasSavedProgress,
    setBookmarks,
    setRecentPages,
    setSavedPage,
    setSavedZoom,
    setSavedSectionId,
    setSavedSectionPage,
    toggleBookmark,
    recordRecentPage,
  };
}

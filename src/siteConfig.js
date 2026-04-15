export const SEIF_HUB_ACCESS_KEY = "seifhub";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getSeifHubAccessConfig(userOrSiteAccess) {
  const siteAccess =
    userOrSiteAccess && userOrSiteAccess.siteAccess
      ? userOrSiteAccess.siteAccess
      : userOrSiteAccess || {};

  const raw = siteAccess?.[SEIF_HUB_ACCESS_KEY];

  if (raw === true) {
    return {
      active: true,
      startDate: "",
      endDate: "",
      indefinite: true,
    };
  }

  if (!raw || typeof raw !== "object") {
    return {
      active: false,
      startDate: "",
      endDate: "",
      indefinite: false,
    };
  }

  return {
    active: !!raw.active,
    startDate: raw.startDate || "",
    endDate: raw.endDate || "",
    indefinite: !!raw.indefinite,
  };
}

function getWindowLocation() {
  if (typeof window === "undefined") return null;
  return window.location;
}

export function getSiteVariant(locationLike = getWindowLocation()) {
  const hostname = locationLike?.hostname || "";
  const search = locationLike?.search || "";
  const params = new URLSearchParams(search);
  const forcedSite = String(params.get("site") || "").split("?")[0];

  const isSeifHub =
    forcedSite === SEIF_HUB_ACCESS_KEY ||
    hostname === "seifhub.beeskillsenglish.com";

  if (isSeifHub) {
    return {
      id: SEIF_HUB_ACCESS_KEY,
      label: "Seif Hub",
      requiresMemberAccess: true,
    };
  }

  return {
    id: "aptis",
    label: "Seif Aptis Trainer",
    requiresMemberAccess: false,
  };
}

export function canAccessSeifHub(user) {
  if (!user) return false;
  if (user.role === "admin" || user.role === "teacher") return true;

  const access = getSeifHubAccessConfig(user);
  if (!access.active) return false;

  const today = todayIsoDate();
  if (access.startDate && today < access.startDate) return false;
  if (!access.indefinite && access.endDate && today > access.endDate) return false;

  return true;
}

export function getSiteHomePath(locationLike = getWindowLocation()) {
  const variant = getSiteVariant(locationLike);
  const hostname = locationLike?.hostname || "";

  if (variant.id === SEIF_HUB_ACCESS_KEY && hostname !== "seifhub.beeskillsenglish.com") {
    return "/?site=seifhub";
  }

  return "/";
}

export function getSitePath(path, locationLike = getWindowLocation()) {
  const variant = getSiteVariant(locationLike);
  const hostname = locationLike?.hostname || "";

  if (variant.id !== SEIF_HUB_ACCESS_KEY || hostname === "seifhub.beeskillsenglish.com") {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}site=seifhub`;
}

import { auth } from "../firebase";

function getBaseUrl() {
  return "https://europe-west1-examplay-auth.cloudfunctions.net/adminAptisWritingSubmissions";
}

async function fetchBridge(path = "") {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in.");
  }

  const token = await user.getIdToken();
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Could not load Aptis Writing General submissions.");
  }

  return Array.isArray(data?.items)
    ? data.items.map((item) => ({
        ...item,
        createdAt: item?.createdAt ? new Date(item.createdAt) : null,
      }))
    : [];
}

export async function fetchAptisWritingGeneralRecentActivity({
  limit = 200,
  before = "",
} = {}) {
  const params = new URLSearchParams({
    mode: "recent",
    limit: String(limit),
  });

  if (before) {
    params.set("before", before);
  }

  return fetchBridge(`?${params.toString()}`);
}

export async function fetchAptisWritingGeneralRangeActivity({ from, to }) {
  const params = new URLSearchParams({
    mode: "range",
    from,
    to,
  });

  return fetchBridge(`?${params.toString()}`);
}

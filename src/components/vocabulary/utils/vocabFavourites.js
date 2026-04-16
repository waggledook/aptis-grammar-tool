import { addFavourite, fetchFavourites, removeFavourite } from "../../../firebase";

const GUEST_VOCAB_FAVS_KEY = "guest_vocab_favourites";

export function makeVocabFavouriteId({ topicId, setId, term }) {
  return `vocab:${topicId}:${setId}:${encodeURIComponent(String(term || "").toLowerCase())}`;
}

export function readGuestVocabFavourites() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_VOCAB_FAVS_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    console.warn("Could not load guest vocab favourites", error);
    return [];
  }
}

export function writeGuestVocabFavourites(ids) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_VOCAB_FAVS_KEY, JSON.stringify([...new Set(ids)]));
  } catch (error) {
    console.warn("Could not save guest vocab favourites", error);
  }
}

export async function fetchVocabFavourites({ isAuthenticated }) {
  if (isAuthenticated) return fetchFavourites();
  return readGuestVocabFavourites();
}

export async function toggleVocabFavourite({ favouriteId, isAuthenticated, isFavourite }) {
  if (!favouriteId) return;

  if (isAuthenticated) {
    if (isFavourite) await removeFavourite(favouriteId);
    else await addFavourite(favouriteId);
    return;
  }

  const current = new Set(readGuestVocabFavourites());
  if (isFavourite) current.delete(favouriteId);
  else current.add(favouriteId);
  writeGuestVocabFavourites([...current]);
}

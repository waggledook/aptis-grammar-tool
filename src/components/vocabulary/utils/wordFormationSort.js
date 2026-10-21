export function getWordFormationSortPrompt(entry) {
  return entry?.cue ? `${entry.baseWord} — ${entry.cue}` : entry?.baseWord || "";
}

export function createWordFormationSortState() {
  return { selectedId: null, placements: {}, mistakeIds: [], feedback: null };
}

export function checkWordFormationPlacement(state, { itemId, categoryId, items, categories }) {
  const entry = items.find((item) => item.id === itemId);
  if (!entry || state.placements[itemId] || !categories.some((category) => category.id === categoryId)) return null;
  return entry.category === categoryId ? "correct" : "wrong";
}

export function wordFormationSortReducer(state, action) {
  if (action.type === "reset") return createWordFormationSortState();
  if (action.type === "select") {
    if (!action.items.some((entry) => entry.id === action.itemId) || state.placements[action.itemId]) return state;
    return { ...state, selectedId: state.selectedId === action.itemId ? null : action.itemId, feedback: null };
  }
  if (action.type !== "place") return state;
  const status = checkWordFormationPlacement(state, action);
  if (!status) return state;
  const feedback = { status, itemId: action.itemId, categoryId: action.categoryId };
  if (status === "wrong") {
    return {
      ...state, selectedId: action.itemId, feedback,
      mistakeIds: [...new Set([...state.mistakeIds, action.itemId])],
    };
  }
  return {
    ...state, feedback,
    selectedId: null,
    placements: { ...state.placements, [action.itemId]: action.categoryId },
  };
}

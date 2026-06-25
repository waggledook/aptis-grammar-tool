export function getUserDisplayLabel(user = {}) {
  return user.displayName || user.name || user.username || user.email || user.id || user.uid || "Unknown user";
}

export function getShortUserId(user = {}) {
  const id = user.id || user.uid || "";
  return id ? id.slice(0, 8) : "";
}

export function getUserIdentityLabel(user = {}, { includeRole = false } = {}) {
  const name = getUserDisplayLabel(user);
  const email = user.email || "";
  const shortId = getShortUserId(user);
  const role = includeRole && user.role ? ` · ${user.role}` : "";
  const parts = [name];

  if (email && email.toLowerCase() !== String(name).toLowerCase()) {
    parts.push(`<${email}>`);
  }
  if (shortId) {
    parts.push(`UID ${shortId}`);
  }

  return `${parts.join(" · ")}${role}`;
}

export function getDuplicateDisplayNameGroups(users = []) {
  const groups = new Map();

  users.forEach((user) => {
    const key = getUserDisplayLabel(user).trim().toLowerCase();
    if (!key) return;
    const group = groups.get(key) || [];
    group.push(user);
    groups.set(key, group);
  });

  return Array.from(groups.values())
    .filter((group) => group.length > 1)
    .sort((a, b) => getUserDisplayLabel(a[0]).localeCompare(getUserDisplayLabel(b[0])));
}

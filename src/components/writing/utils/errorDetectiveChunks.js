export function getErrorChunks(item) {
  const tokens = [...item.sentence.matchAll(/\S+/g)].map((match) => ({ text: match[0], start: match.index, end: match.index + match[0].length }));
  const targetStart = item.sentence.indexOf(item.target);
  const targetEnd = targetStart + item.target.length;
  if (targetStart < 0 || !tokens.length) return [{ text: item.sentence, target: true }];
  let start = tokens.findIndex((token) => token.end > targetStart);
  let end = -1;
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    if (tokens[index].start < targetEnd) { end = index; break; }
  }
  if (start < 0 || end < start) return [{ text: item.sentence, target: true }];
  const preferLeft = item.id.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0) % 2 === 0;
  while (end - start + 1 < 3 && (start > 0 || end < tokens.length - 1)) {
    if ((preferLeft && start > 0) || end === tokens.length - 1) start -= 1;
    else end += 1;
  }
  if (start === 1) start = 0;
  if (tokens.length - end - 1 === 1) end = tokens.length - 1;
  const partition = (slice) => {
    if (!slice.length) return [];
    const chunkCount = Math.ceil(slice.length / 3);
    const baseSize = Math.floor(slice.length / chunkCount);
    const longerChunks = slice.length % chunkCount;
    const result = [];
    let cursor = 0;
    for (let index = 0; index < chunkCount; index += 1) {
      const size = baseSize + (index < longerChunks ? 1 : 0);
      result.push({ text: slice.slice(cursor, cursor + size).map((token) => token.text).join(" ") });
      cursor += size;
    }
    return result;
  };
  return [...partition(tokens.slice(0, start)), { text: tokens.slice(start, end + 1).map((token) => token.text).join(" "), target: true }, ...partition(tokens.slice(end + 1))];
}

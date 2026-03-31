const BASE_SECTIONS = [
  { label: "Cover", page: 1, id: "cover" },
  { label: "Introduction", page: 2, id: "introduction" },
  { label: "Core: Grammar", page: 6, id: "core-grammar" },
  { label: "Core: Vocab", page: 16, id: "core-vocab" },
  { label: "Reading: Part 1", page: 21, id: "reading-part-1" },
  { label: "Reading: Part 2", page: 25, id: "reading-part-2" },
  { label: "Reading: Part 3", page: 31, id: "reading-part-3" },
  { label: "Reading: Part 4", page: 37, id: "reading-part-4" },
  { label: "Speaking: Part 1", page: 43, id: "speaking-part-1" },
  { label: "Speaking: Part 2", page: 47, id: "speaking-part-2" },
  { label: "Speaking: Part 3", page: 57, id: "speaking-part-3" },
  { label: "Speaking: Part 4", page: 64, id: "speaking-part-4" },
  { label: "Writing: Part 1", page: 71, id: "writing-part-1" },
  { label: "Writing: Part 2", page: 73, id: "writing-part-2" },
  { label: "Writing: Part 3", page: 75, id: "writing-part-3" },
  { label: "Writing: Part 4", page: 77, id: "writing-part-4" },
];

export const COURSE_PACK_TOTAL_PAGES = 78;

export const COURSE_PACK_SECTIONS = BASE_SECTIONS.map((section, index) => {
  const next = BASE_SECTIONS[index + 1];
  const startPage = section.page;
  const endPage = next ? next.page - 1 : COURSE_PACK_TOTAL_PAGES;
  return {
    ...section,
    startPage,
    endPage,
    pageCount: endPage - startPage + 1,
    storagePath: `packs/seif-pack-v1/sections/${section.id}.pdf`,
  };
});

export function getCoursePackSectionForPage(page) {
  let current = COURSE_PACK_SECTIONS[0] || null;
  COURSE_PACK_SECTIONS.forEach((section) => {
    if (page >= section.startPage) current = section;
  });
  return current;
}

export function getCoursePackSectionById(id) {
  return COURSE_PACK_SECTIONS.find((section) => section.id === id) || null;
}

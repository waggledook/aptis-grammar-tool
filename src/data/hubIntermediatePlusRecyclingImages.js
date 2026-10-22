const ROOT = "/images/vocab/intermediate-plus/rubbish-and-recycling";

// Supplied cutouts retain alpha. Brief cues distinguish related containers;
// no image backgrounds or category-dependent recycling rules are added.
export const INTERMEDIATE_PLUS_RECYCLING_IMAGES = {
  bin: { image: `${ROOT}/bin.webp` },
  "bin bag": { image: `${ROOT}/bin-bag.webp` },
  "landfill site": { image: `${ROOT}/landfill-site.webp`, imageKind: "scene", imagePrompt: "Name the place where waste is buried." },
  "refuse collector": { image: `${ROOT}/refuse-collector.webp`, imageKind: "scene", imagePrompt: "Name the worker collecting household rubbish." },
  rubbish: { image: `${ROOT}/rubbish.webp`, imageKind: "scene", imagePrompt: "Name the unwanted things left on the ground." },
  "waste-paper basket": { image: `${ROOT}/waste-paper-basket.webp`, imagePrompt: "A small indoor container for unwanted paper." },
  bottle: { image: `${ROOT}/bottle.webp`, imagePrompt: "Name the narrow-necked glass container, rather than its contents." },
  can: { image: `${ROOT}/can.webp`, imagePrompt: "Name the metal drinks container." },
  "cardboard box": { image: `${ROOT}/cardboard-box.webp` },
  carton: { image: `${ROOT}/carton.webp`, imagePrompt: "Name the paper-based milk container." },
  jar: { image: `${ROOT}/jar.webp`, imagePrompt: "Name the wide-mouthed glass container, rather than its contents." },
  lid: { image: `${ROOT}/lid.webp`, imagePrompt: "A flat removable cover for a food container." },
  cap: { image: `${ROOT}/cap.webp`, imagePrompt: "A small screw-on top for a bottle." },
  packet: { image: `${ROOT}/packet.webp`, imagePrompt: "A sealed bag of crisps." },
  "plastic bag": { image: `${ROOT}/plastic-bag.webp` },
  pot: { image: `${ROOT}/pot.webp`, imagePrompt: "Name the small container for one serving of yoghurt." },
  pouch: { image: `${ROOT}/pouch.webp`, imagePrompt: "A flexible food pack that stands upright and can be resealed." },
  "sell-by date": { image: `${ROOT}/sell-by-date.webp`, imageKind: "scene", studyOnly: true, imagePrompt: "Read the label: what is this type of date called?" },
  tin: { image: `${ROOT}/tin.webp`, imagePrompt: "Name the metal food container, rather than its contents." },
  "polystyrene tray": { image: `${ROOT}/polystyrene-tray.webp`, imagePrompt: "A light, rigid foam base used for packaged food." },
  tub: { image: `${ROOT}/tub.webp`, imagePrompt: "Name the wide plastic container for spread." },
  wrapper: { image: `${ROOT}/wrapper.webp`, imagePrompt: "Name the thin outer covering, rather than the chocolate." },
  "take out": { image: `${ROOT}/take-out.webp`, imagePrompt: "Use a phrasal verb: carry the rubbish from indoors to the bins outside." },
  "throw away": { image: "/images/vocab/pre-int/phrasal-verbs/throw-away.webp", imageKind: "scene", imagePrompt: "Use a phrasal verb meaning discard: _____ the unwanted paper." },
};

const ROOT = "/images/vocab/intermediate-plus/photography";

// Neutral cues identify the intended subject without printing its answer.
// SVGs are built by scripts/build-photography-diagrams.py; supplied photos use WebP.
export const INTERMEDIATE_PLUS_PHOTOGRAPHY_IMAGES = {
  behind: { image: `${ROOT}/countryside-reference-sharp.webp`, imagePrompt: "The man, relative to the woman: he is _____ her." },
  "in the background": { image: `${ROOT}/countryside-reference-sharp.webp`, imagePrompt: "Describe the hills as the part of the scene behind the walkers." },
  "in the bottom right-hand corner": { image: `${ROOT}/position-bottom-right.svg`, imagePrompt: "Where is the gold dot in the picture?" },
  "in the centre": { image: `${ROOT}/position-centre.svg`, imagePrompt: "Where is the gold dot in the picture?" },
  "in the distance": { image: `${ROOT}/countryside-reference-sharp.webp`, imagePrompt: "Describe how far away the church is: it is _____." },
  "in the foreground": { image: `${ROOT}/countryside-reference-sharp.webp`, imagePrompt: "Describe the dog as part of the scene nearest the viewer." },
  "in front of": { image: `${ROOT}/countryside-reference-sharp.webp`, imagePrompt: "The woman, relative to the man: she is _____ him." },
  "in the top left-hand corner": { image: `${ROOT}/position-top-left.svg`, imagePrompt: "Where is the gold dot in the picture?" },
  "on top of": { image: `${ROOT}/frame-surface.svg`, imagePrompt: "The real ball is resting _____ the wooden frame." },
  opposite: { image: "/images/vocab/a2-prepositions/opposite.webp", imagePrompt: "The two women face each other across the table. One sits _____ the other." },
  "at the top of": { image: `${ROOT}/picture-upper-area.svg`, imagePrompt: "The ball is painted inside the picture: it is _____ the picture." },
  flash: { image: `${ROOT}/camera-flash.svg`, imagePrompt: "Name the camera feature producing this burst of light." },
  "zoom in": { image: `${ROOT}/camera-zoom.svg`, imagePrompt: "Which camera action makes the subject larger while you stay in the same place?" },
  "out of focus": { image: `${ROOT}/countryside-out-of-focus.webp`, imagePrompt: "Describe the sharpness of the whole photo." },
  "portrait setting": { image: `${ROOT}/camera-portrait.svg`, imagePrompt: "Name the selected camera mode for photographing a person." },
  overexposed: { image: `${ROOT}/countryside-overexposed.webp`, imagePrompt: "Describe the exposure: bright areas have lost detail." },
  lens: { image: `${ROOT}/camera-lens.svg`, imagePrompt: "Name the round optical part marked in gold." },
  "wide-angle lens": { image: `${ROOT}/countryside-wide-angle.webp`, imagePrompt: "Which kind of lens includes a broader view of the scenery?" },
  edit: { image: `${ROOT}/photo-edit.svg`, imagePrompt: "After saving the original, change its framing and brightness. What verb describes this work?" },
  "close-up": { image: `${ROOT}/dog-close-up.webp`, imagePrompt: "What kind of shot fills the frame with the dog's face?" },
  landscape: { image: `${ROOT}/countryside-wide-angle.webp`, imagePrompt: "Name this type of photograph of natural scenery." },
  settings: { image: `${ROOT}/camera-settings.svg`, imagePrompt: "What is the general word for the camera controls you can adjust?" },
};

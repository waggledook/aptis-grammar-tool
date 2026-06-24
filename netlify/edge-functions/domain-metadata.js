const SITE_METADATA = {
  "aptis-trainer.beeskillsenglish.com": {
    title: "Seif Aptis Trainer | BeeSkills English",
    description:
      "Interactive Aptis Trainer for Aptis General practice: grammar, speaking, writing, reading, listening, and vocabulary.",
    canonical: "https://aptis-trainer.beeskillsenglish.com/",
    image: "https://aptis-trainer.beeskillsenglish.com/og-image.jpg",
    appName: "Seif Aptis Trainer | Seif English Academy",
  },
  "seifhub.beeskillsenglish.com": {
    title: "Seif Hub | BeeSkills English",
    description:
      "Private SeifHub course practice for BeeSkills English students: class activities, progress tests, vocabulary, grammar, listening, and course resources.",
    canonical: "https://seifhub.beeskillsenglish.com/",
    image: "https://seifhub.beeskillsenglish.com/og-image.jpg",
    appName: "Seif Hub | BeeSkills English",
  },
  "ote-seif.beeskillsenglish.com": {
    title: "OTE Seif | BeeSkills English",
    description:
      "OTE preparation app for BeeSkills English students with speaking, writing, register, and exam-style practice.",
    canonical: "https://ote-seif.beeskillsenglish.com/",
    image: "https://ote-seif.beeskillsenglish.com/og-image.jpg",
    appName: "OTE Seif | BeeSkills English",
  },
};

function replaceRequired(html, pattern, replacement) {
  if (!pattern.test(html)) return html;
  return html.replace(pattern, replacement);
}

function applyMetadata(html, metadata) {
  let next = html;
  next = replaceRequired(next, /<title>.*?<\/title>/s, `<title>${metadata.title}</title>`);
  next = replaceRequired(
    next,
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${metadata.description}" />`
  );
  next = replaceRequired(
    next,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${metadata.canonical}" />`
  );
  next = replaceRequired(
    next,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${metadata.title}" />`
  );
  next = replaceRequired(
    next,
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${metadata.description}" />`
  );
  next = replaceRequired(
    next,
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${metadata.canonical}" />`
  );
  next = replaceRequired(
    next,
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${metadata.image}" />`
  );
  next = replaceRequired(
    next,
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${metadata.title}" />`
  );
  next = replaceRequired(
    next,
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${metadata.description}" />`
  );
  next = replaceRequired(
    next,
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${metadata.image}" />`
  );
  next = next.replace(
    /"name": "Seif Aptis Trainer \| Seif English Academy"/,
    `"name": "${metadata.appName}"`
  );
  next = next.replace(
    /"url": "https:\/\/aptis-trainer\.beeskillsenglish\.com\/"/g,
    `"url": "${metadata.canonical}"`
  );
  next = next.replace(
    /"description": "Interactive Aptis Trainer — practise all parts of the Aptis General exam: Grammar, Speaking, Writing, and Reading\. Track your progress and build exam confidence\."/,
    `"description": "${metadata.description}"`
  );
  next = next.replace(
    /"logo": "https:\/\/aptis-trainer\.beeskillsenglish\.com\/og-image\.jpg"/,
    `"logo": "${metadata.image}"`
  );
  return next;
}

export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  const hostname = new URL(request.url).hostname;
  const metadata = SITE_METADATA[hostname];

  if (!metadata || !contentType.includes("text/html")) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "public, max-age=0, must-revalidate");

  return new Response(applyMetadata(await response.text(), metadata), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

# Project deployment

- The production frontend is deployed from GitHub by Netlify.
- Never deploy this project's frontend with Firebase Hosting (`firebase deploy --only hosting`) unless the user explicitly requests it.
- When the user asks to deploy frontend changes, use the repository's normal GitHub workflow so Netlify performs the deployment. Do not assume that a local production build has been published.
- Firebase is used for backend services. Deploy individual Firebase Cloud Functions when required, but treat Functions deployment and frontend deployment as separate operations.
- Before any broad deployment, state exactly which targets will be updated (GitHub/Netlify frontend, Firebase Functions, Firestore rules, or another service).

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Local AI writing feedback test

The OTE writing mock completion screen includes a manual **Generate AI feedback** button for local testing.

1. Start the Functions emulator with your OpenAI key:

```bash
OPENAI_API_KEY=sk-... npm --prefix functions run serve
```

2. Start Vite with the Functions emulator enabled:

```bash
VITE_USE_FUNCTIONS_EMULATOR=true npm run dev
```

3. Sign in, then test either feedback flow:
   - Complete an OTE writing mock, then click **Generate AI feedback** on the results screen.
   - Complete Aptis Writing Part 1, then click **Generate AI feedback** on the summary screen.
   - Complete Aptis Writing Part 2 or Part 3, then click **Generate AI feedback** on the summary screen.
   - Complete Aptis Writing Part 4, then click **Generate AI feedback** on the summary screen.

The original generic callable function is `generateWritingFeedback` in `functions/index.js`. It defaults to `gpt-5.4-mini`, uses structured JSON output, and keeps the API key on the server side.

OTE writing mocks use `generateOteWritingFeedback`. It supports OTE Part 1 email and Part 2 essay/article/review task profiles, checks task fulfilment, organization, grammar, lexis, word count, and returns broad OTE-style level labels up to Strong B2 range.

Aptis Writing Part 1 uses its own callable function, `generateAptisWritingPart1Feedback`, because the marking priorities are different: communication first, 1-5 words, and language points treated as learning feedback rather than formal scoring.

Aptis Writing Parts 2 and 3 share `generateAptisWritingPart23Feedback`. It uses Aptis-style criteria, treats the published word ranges as recommended ranges rather than hard limits, and gives per-answer improved versions plus priority advice.

Aptis Writing Part 4 uses `generateAptisWritingPart4Feedback`. It focuses heavily on task-specific content, register contrast between the informal and formal emails, and practical word-count ranges. Informal emails up to 75 words and formal emails up to 225 words are not criticised for length alone.

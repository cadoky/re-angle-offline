# Re-angle!

Prompt generator for AI photo editing. Pick a new camera angle, lens, light and look for a reference photo, and Re-angle writes the prompt for your target model. Everything runs in the browser; nothing is sent anywhere.

Live: https://re-angle.vercel.app

## Targets

| Target | Output |
|---|---|
| Gemini (Nano Banana) | `re-angle/v2` JSON with a narrative `prompt` field |
| Flux Kontext | One edit instruction paragraph |
| SD / ComfyUI | Tag list + `Negative prompt:` line |
| Text | Plain narrative paragraph |

Fields left on "Maintain Original" are not written; they go to the `preserve` list instead.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # prompt engine checks (engine/buildPrompt.test.ts)
npm run build
```

## Layout

- `engine/buildPrompt.ts`: pure `buildPrompt(settings, target)` and `getWarnings(settings)`
- `data/`: option lists, locales (option keys are the English values the engine reads), lighting texts, random scenarios
- `App.tsx`: UI; all prompt settings live in one `settings` object

Pushing to `main` deploys to Vercel.

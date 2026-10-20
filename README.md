# Re-angle!

Prompt generator for AI photo editing. Pick a new camera angle, lens, light and look for a reference photo, and Re-angle writes the prompt for your target model. Everything runs in the browser; nothing is sent anywhere.

Live: https://re-angle.vercel.app

## Targets

| Target | Output |
|---|---|
| JSON | `re-angle/v2` JSON with a narrative `prompt` field (any model that reads JSON) |
| Gemini (Nano Banana) | "Using the provided photo of this person, …" edit paragraph |
| ChatGPT (GPT image) | Sectioned instructions with bullet lists and an explicit keep list |
| Midjourney V7 | Descriptive phrases + `--oref <REFERENCE_IMAGE_URL> --ow 300 --ar … --style raw --v 7 --no …` |
| Flux Kontext | One edit instruction paragraph |
| Seedream | Short edit directive ending in a keep-unchanged list |
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
- `data/`: option lists, locales (option keys are the English values the engine reads), lighting texts, random scenario pool (`scenarios.json`), top-down lighting diagram data (`lightingSetups.ts`)
- `components/LightingEditor.tsx`: top-down custom light plot (up to 5 lights, `settings.customLights`, lighting value `Custom Setup`)
- `App.tsx`: UI; all prompt settings live in one `settings` object

Pushing to `main` deploys to Vercel.

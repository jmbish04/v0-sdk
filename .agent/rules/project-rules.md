# Antigravity Cloudflare Rules
- **Schema Management**: All D1 changes must originate from `src/server/schema.ts` and be pushed via `pnpm run generate:db`.
- **Generative Execution**: Vercel AI SDK strictly utilizes the Cloudflare OpenAI-compatible endpoint structured around AI Gateway URLs.
- **Style Requirements**: UI defaults strictly to dark-mode Shadcn color palettes bound via CSS custom properties.
- **Routing Paradigm**: Hono mounts entirely on Astro's `/api/[...route].ts` wildcard adapter for server-side function execution.

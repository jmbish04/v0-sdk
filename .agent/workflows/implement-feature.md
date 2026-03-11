# V0-Clone End-to-End Implementation Workflow

1. **Environment Setup & Provisioning**:
   - Initialize D1 database and bind to `v0-clone-db`.
   - Update `wrangler.json` with generated D1 `database_id`.
   - Setup AI Gateway in Cloudflare Dashboard and set `AI_GATEWAY_URL` in `wrangler.json`.
   - Set secret `CF_API_TOKEN` in Cloudflare Pages.

2. **Database Migration**:
   - Run `pnpm run migrate:db` to apply local Drizzle schema.

3. **Frontend Initialization**:
   - Ensure `@ai-sdk/react` handles chat state globally.
   - Inject `react-live` for instant component rendering within Shadcn variables context.

4. **API and Routing Activation**:
   - Start the Astro build step locally using `pnpm run dev`.
   - Verify `/health`, `/context`, `/openapi.json`, and `/scalar` return 200 OK.

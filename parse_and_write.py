import os

files = {
    "package.json": """{
  "name": "v0-clone",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "migrate:db": "wrangler d1 migrations apply v0-clone-db --local",
    "migrate:prod": "wrangler d1 migrations apply v0-clone-db --remote",
    "generate:db": "drizzle-kit generate"
  },
  "dependencies": {
    "@ai-sdk/openai": "^1.1.9",
    "@ai-sdk/react": "^1.1.11",
    "@astrojs/cloudflare": "^11.0.3",
    "@astrojs/react": "^3.6.0",
    "@astrojs/tailwind": "^5.1.0",
    "@hono/swagger-ui": "^0.5.0",
    "@hono/zod-openapi": "^0.18.3",
    "@scalar/hono-api-reference": "^0.5.166",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "ai": "^4.1.25",
    "astro": "^4.14.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "drizzle-orm": "^0.33.0",
    "hono": "^4.5.9",
    "lucide-react": "^0.436.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-live": "^4.1.6",
    "tailwind-merge": "^2.5.2",
    "tailwindcss": "^3.4.10",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "drizzle-kit": "^0.24.2",
    "typescript": "^5.5.4",
    "wrangler": "^3.72.0"
  }
}""",
    "tsconfig.json": """{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "target": "ES2022",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "module": "ESNext",
    "strict": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}""",
    "astro.config.mjs": """import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});""",
    "tailwind.config.mjs": """/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}""",
    "wrangler.json": """{
  "name": "v0-clone",
  "pages_build_output_dir": "./dist",
  "compatibility_date": "2024-03-20",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "v0-clone-db",
      "database_id": "REPLACE_WITH_YOUR_D1_ID",
      "migrations_dir": "drizzle"
    }
  ],
  "vars": {
    "AI_GATEWAY_URL": "https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/v0-clone-gateway/cloudflare"
  }
}""",
    "drizzle.config.ts": """import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/server/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
});""",
    "drizzle/0000_initial.sql": """CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL
);
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE no action
);""",
    "src/server/schema.ts": """import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  chatId: text('chat_id').references(() => chats.id).notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});""",
    "src/server/app.ts": """import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { swaggerUI } from '@hono/swagger-ui';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { drizzle } from 'drizzle-orm/d1';

type Bindings = {
  DB: D1Database;
  AI_GATEWAY_URL: string;
  CF_API_TOKEN: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.openapi(
  createRoute({
    method: 'get',
    path: '/health',
    responses: {
      200: {
        description: 'Healthcheck',
        content: { 'application/json': { schema: z.object({ status: z.string() }) } }
      }
    }
  }),
  (c) => c.json({ status: 'ok' })
);

app.openapi(
  createRoute({
    method: 'get',
    path: '/context',
    responses: {
      200: {
        description: 'System Context',
        content: { 'application/json': { schema: z.object({ name: z.string(), environment: z.string() }) } }
      }
    }
  }),
  (c) => c.json({ name: 'v0-clone', environment: 'cloudflare-pages' })
);

app.openapi(
  createRoute({
    method: 'get',
    path: '/docs',
    responses: {
      302: { description: 'Redirect to scalar docs' }
    }
  }),
  (c) => c.redirect('/scalar')
);

app.doc31('/openapi.json', {
  openapi: '3.1.0',
  info: { title: 'v0 Clone API', version: '1.0.0' },
});

app.get('/scalar', apiReference({ spec: { url: '/openapi.json' } }));
app.get('/swagger', swaggerUI({ url: '/openapi.json' }));

app.post('/api/chat', async (c) => {
  const { messages: reqMessages } = await c.req.json();
  const env = c.env;

  const cfOpenAI = createOpenAI({
    baseURL: `${env.AI_GATEWAY_URL}/v1`,
    apiKey: env.CF_API_TOKEN,
  });

  const db = drizzle(env.DB);

  const result = streamText({
    model: cfOpenAI('@cf/meta/llama-3.1-8b-instruct'),
    system: `You are an expert React frontend developer. Generate a clean, modern React component using Tailwind CSS based on the user request. Output ONLY the raw tsx code inside a \`\`\`tsx codeblock. Use lucide-react icons if needed.`,
    messages: reqMessages,
  });

  return result.toDataStreamResponse();
});

export default app;""",
    "src/pages/api/[...route].ts": """import type { APIRoute } from 'astro';
import app from '../../server/app';

export const ALL: APIRoute = ({ request, locals }) => {
  const runtime = locals.runtime;
  return app.fetch(request, runtime.env);
};""",
    "src/pages/index.astro": """---
import '../styles/globals.css';
import ChatUI from '../components/ChatUI';
---
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>v0 Clone SDK</title>
  </head>
  <body class="bg-background text-foreground antialiased">
    <ChatUI client:load />
  </body>
</html>""",
    "src/styles/globals.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}""",
    "src/components/ChatUI.tsx": """import { useChat } from '@ai-sdk/react';
import React from 'react';
import { Send, Terminal } from 'lucide-react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';

export default function ChatUI() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const extractCode = (content: string) => {
    const match = content.match(/```tsx?\\n([\\s\\S]*?)\\n```/);
    return match ? match[1] : null;
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <div className="w-1/3 border-r border-border flex flex-col bg-background">
        <header className="p-4 border-b border-border flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <h1 className="font-bold text-lg">v0 Clone Workspace</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`p-4 rounded-lg ${m.role === 'user' ? 'bg-secondary ml-8' : 'bg-muted mr-8'}`}>
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{m.role}</div>
              <div className="whitespace-pre-wrap text-sm">{m.content}</div>
            </div>
          ))}
          {isLoading && <div className="text-muted-foreground animate-pulse text-sm">Synthesizing components...</div>}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Design a dashboard widget..."
              className="w-full bg-input border border-border rounded-md py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <button type="submit" disabled={isLoading || !input} className="absolute right-2 top-2 p-1.5 bg-primary text-primary-foreground hover:opacity-90 rounded-md disabled:opacity-50 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="w-2/3 bg-muted p-8 flex flex-col">
        <div className="flex-1 bg-background rounded-xl overflow-hidden shadow-2xl ring-1 ring-border relative">
           {messages.filter(m => m.role === 'assistant').slice(-1).map((m) => {
             const code = extractCode(m.content);
             if (!code) return <div key={m.id} className="p-8 text-muted-foreground">Waiting for implementation...</div>;
             return (
               <LiveProvider key={m.id} code={code} noInline={false}>
                 <div className="h-full w-full overflow-auto">
                   <LivePreview className="p-8" />
                 </div>
                 <LiveError className="absolute bottom-0 left-0 right-0 bg-destructive/90 text-destructive-foreground p-4 font-mono text-sm" />
               </LiveProvider>
             );
           })}
        </div>
      </div>
    </div>
  );
}""",
    ".agent/workflows/implement-feature.md": """# V0-Clone End-to-End Implementation Workflow

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
""",
    ".agent/rules/project-rules.md": """# Antigravity Cloudflare Rules
- **Schema Management**: All D1 changes must originate from `src/server/schema.ts` and be pushed via `pnpm run generate:db`.
- **Generative Execution**: Vercel AI SDK strictly utilizes the Cloudflare OpenAI-compatible endpoint structured around AI Gateway URLs.
- **Style Requirements**: UI defaults strictly to dark-mode Shadcn color palettes bound via CSS custom properties.
- **Routing Paradigm**: Hono mounts entirely on Astro's `/api/[...route].ts` wildcard adapter for server-side function execution.
"""
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath) if os.path.dirname(filepath) else '.', exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(content)

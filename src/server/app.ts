import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { swaggerUI } from '@hono/swagger-ui';
import { streamText, type CoreMessage } from 'ai';

import { createOpenAI } from '@ai-sdk/openai';

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

  if (!Array.isArray(reqMessages)) {
    return c.json({ error: 'messages must be an array' }, 400);
  }

  // Basic validation and sanitization
  const validRoles = ['user', 'assistant', 'system'];
  const sanitizedMessages: CoreMessage[] = reqMessages
    .filter(m => m && typeof m.content === 'string' && validRoles.includes(m.role))
    .map(m => ({
      id: m.id || String(Date.now()),
      role: m.role,
      content: m.content.substring(0, 10000) // basic length limit
    }));

  let gatewayUrl = env.AI_GATEWAY_URL;
  try {
    const parsedUrl = new URL(env.AI_GATEWAY_URL);
    // Ensure no double slashes when joining path
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '') + '/v1';
    gatewayUrl = parsedUrl.toString();
  } catch (e) {
    // If not a valid URL, fallback to string concat but strip trailing slashes
    gatewayUrl = env.AI_GATEWAY_URL.replace(/\/+$/, '') + '/v1';
  }

  const cfOpenAI = createOpenAI({
    baseURL: gatewayUrl,
    apiKey: env.CF_API_TOKEN,
  });

  const result = streamText({
    model: cfOpenAI('@cf/meta/llama-3.1-8b-instruct'),
    system: `You are an expert React frontend developer. Generate a clean, modern React component using Tailwind CSS based on the user request. Output ONLY the raw tsx code inside a \`\`\`tsx codeblock. Use lucide-react icons if needed.`,
    messages: sanitizedMessages,
  });

  return result.toDataStreamResponse();
});

export default app;

import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
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

export default app;

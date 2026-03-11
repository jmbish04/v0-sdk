import type { APIRoute } from 'astro';
import app from '../../server/app';

export const ALL: APIRoute = ({ request, locals }) => {
  const runtime = locals.runtime;
  return app.fetch(request, runtime.env);
};
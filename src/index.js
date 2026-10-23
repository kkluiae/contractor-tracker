/**
 * Cloudflare Worker
 * - Handles /api/* routes (talks to D1)
 * - Everything else is served from static assets (public/)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ---------- API routes ----------
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    // ---------- Static assets ----------
    // Fall through to the assets binding
    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request, env, url) {
  // CORS preflight (useful if you ever call from another origin)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders(),
    });
  }

  try {
    // GET /api/locations  → list all
    if (url.pathname === "/api/locations" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT id, name, lat, lng, notes, updated_at
         FROM locations
         ORDER BY updated_at DESC`
      ).all();

      return Response.json(results, {
        headers: corsHeaders(),
      });
    }

    // POST /api/location  → add new
    if (url.pathname === "/api/location" && request.method === "POST") {
      const body = await request.json();
      const { name, lat, lng, notes } = body;

      if (!name || lat === undefined || lng === undefined) {
        return Response.json(
          { error: "name, lat and lng are required" },
          { status: 400, headers: corsHeaders() }
        );
      }

      const result = await env.DB.prepare(
        `INSERT INTO locations (name, lat, lng, notes, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         RETURNING id`
      )
        .bind(name, lat, lng, notes || null)
        .first();

      return Response.json(
        { success: true, id: result.id },
        { headers: corsHeaders() }
      );
    }

    // Unknown API route
    return Response.json(
      { error: "Not found" },
      { status: 404, headers: corsHeaders() }
    );
  } catch (err) {
    return Response.json(
      { error: err.message || "Internal error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

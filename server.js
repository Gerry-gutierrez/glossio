/* GlossIO server for Railway — serves static site + API functions */
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, "_site");
const FUNCTIONS_DIR = path.join(__dirname, "netlify", "functions");

/* Generate runtime config from env vars */
const configJS = `
window.__GLOSSIO_SUPABASE_URL = "${process.env.SUPABASE_URL || ""}";
window.__GLOSSIO_SUPABASE_ANON_KEY = "${process.env.SUPABASE_ANON_KEY || ""}";
window.__GLOSSIO_STRIPE_KEY = "${process.env.STRIPE_PUBLISHABLE_KEY || ""}";
window.__GLOSSIO_SENTRY_DSN = "${process.env.SENTRY_DSN || ""}";
`;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

/* CORS headers for API routes */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

/* Handle API requests — routes /.netlify/functions/<name> to the function handler */
async function handleAPI(req, res, functionName) {
  /* Handle CORS preflight */
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const functionFile = path.join(FUNCTIONS_DIR, functionName + ".mjs");

  if (!fs.existsSync(functionFile)) {
    res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
    res.end(JSON.stringify({ error: "Function not found" }));
    return;
  }

  try {
    /* Read request body */
    let body = "";
    await new Promise((resolve) => {
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", resolve);
    });

    /* Parse query string */
    const parsed = url.parse(req.url, true);

    /* Build Netlify-style event object */
    const event = {
      httpMethod: req.method,
      body: body || null,
      headers: req.headers,
      queryStringParameters: parsed.query || {},
      path: parsed.pathname,
      isBase64Encoded: false
    };

    /* Import and call the function handler */
    const funcModule = await import("file://" + functionFile.replace(/\\/g, "/"));
    const result = await funcModule.handler(event);

    /* Send response */
    const responseHeaders = {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(result.headers || {})
    };
    res.writeHead(result.statusCode || 200, responseHeaders);
    res.end(result.body || "");
  } catch (err) {
    console.error("Function error [" + functionName + "]:", err);
    res.writeHead(500, { "Content-Type": "application/json", ...corsHeaders });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

/* Serve static files */
function serveStatic(req, res) {
  /* Serve runtime config */
  if (req.url === "/config.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(configJS);
    return;
  }

  var reqUrl = req.url.split("?")[0];
  var filePath = path.join(SITE_DIR, reqUrl);

  /* Directory -> index.html */
  if (!path.extname(filePath)) {
    var withIndex = path.join(filePath, "index.html");
    if (fs.existsSync(withIndex)) filePath = withIndex;
  }

  fs.readFile(filePath, function (err, content) {
    if (err) {
      /* 404 fallback to index.html (SPA-style) */
      fs.readFile(path.join(SITE_DIR, "index.html"), function (err2, fallback) {
        if (err2) {
          res.writeHead(404);
          res.end("Not found");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(fallback);
        }
      });
    } else {
      var ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      res.end(content);
    }
  });
}

/* Main request handler */
async function serve(req, res) {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  /* Route API calls: /.netlify/functions/<name> */
  const apiMatch = pathname.match(/^\/.netlify\/functions\/([a-z0-9_-]+)/i);
  if (apiMatch) {
    await handleAPI(req, res, apiMatch[1]);
    return;
  }

  /* Everything else is static */
  serveStatic(req, res);
}

http.createServer(serve).listen(PORT, function () {
  console.log("GlossIO serving on port " + PORT);
  console.log("  Static site: /_site");
  console.log("  API: /.netlify/functions/*");
});

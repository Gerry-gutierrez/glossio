/* Simple static server for Railway deployment */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, "_site");

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

function serve(req, res) {
  /* Serve runtime config */
  if (req.url === "/config.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(configJS);
    return;
  }

  var url = req.url.split("?")[0];
  var filePath = path.join(SITE_DIR, url);

  /* Directory → index.html */
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

http.createServer(serve).listen(PORT, function () {
  console.log("GlossIO serving on port " + PORT);
});

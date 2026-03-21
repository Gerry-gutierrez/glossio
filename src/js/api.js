/* ─── API Helper ─────────────────────────────────────────────────────────── */
/* Routes API calls to Railway Netlify Functions.                              */
/* Provides: window.api.call(functionName, body)                              */

(function() {
  "use strict";

  window.api = {
    /**
     * Call a Netlify Function on Railway.
     * @param {string} name - Function name (e.g. "send-code")
     * @param {object} body - Request body (will be JSON-stringified)
     * @param {string} [method] - HTTP method (default "POST")
     * @returns {Promise<object>} Response JSON
     */
    call: function(name, body, method) {
      var url = "/.netlify/functions/" + name;
      var opts = {
        method: method || "POST",
        headers: {
          "Content-Type": "application/json"
        }
      };

      if (body && (method || "POST") !== "GET") {
        opts.body = JSON.stringify(body);
      }

      return fetch(url, opts).then(function(res) {
        return res.json();
      });
    },

    /** Convenience: GET with query params */
    get: function(name, params) {
      var qs = params ? "?" + new URLSearchParams(params).toString() : "";
      var url = "/.netlify/functions/" + name + qs;
      return fetch(url).then(function(res) {
        return res.json();
      });
    }
  };

})();

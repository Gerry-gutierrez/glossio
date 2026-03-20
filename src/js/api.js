/* ─── API Helper ─────────────────────────────────────────────────────────── */
/* Routes API calls to Supabase Edge Functions.                               */
/* Provides: window.api.call(functionName, body)                              */

(function() {
  "use strict";

  var supabaseUrl = window.__GLOSSIO_SUPABASE_URL || "";

  window.api = {
    /**
     * Call a Supabase Edge Function.
     * @param {string} name - Function name (e.g. "send-code")
     * @param {object} body - Request body (will be JSON-stringified)
     * @param {string} [method] - HTTP method (default "POST")
     * @returns {Promise<object>} Response JSON
     */
    call: function(name, body, method) {
      var url = supabaseUrl + "/functions/v1/" + name;
      var opts = {
        method: method || "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (window.__GLOSSIO_SUPABASE_ANON_KEY || "")
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
      var url = (supabaseUrl || "") + "/functions/v1/" + name + qs;
      return fetch(url, {
        headers: {
          "Authorization": "Bearer " + (window.__GLOSSIO_SUPABASE_ANON_KEY || "")
        }
      }).then(function(res) {
        return res.json();
      });
    }
  };

})();

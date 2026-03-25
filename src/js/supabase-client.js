/* ─── Supabase Client ─────────────────────────────────────────────────────── */
/* Loaded after the Supabase CDN script in base.njk                          */
/* Provides: window.sbClient, window.sbAuth                                   */

(function() {
  "use strict";

  /* ── Config ── */
  var SUPABASE_URL = window.__GLOSSIO_SUPABASE_URL || "";
  var SUPABASE_ANON_KEY = window.__GLOSSIO_SUPABASE_ANON_KEY || "";

  /* ── Create client (only if keys are configured) ── */
  var client = null;

  if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  /* ── Auth helpers ── */
  var auth = {
    /** Get current session (returns { user, session } or null) */
    getSession: function() {
      if (!client) return Promise.resolve(null);
      return client.auth.getSession().then(function(r) {
        return r.data.session;
      });
    },

    /** Get current user */
    getUser: function() {
      if (!client) return Promise.resolve(null);
      return client.auth.getUser().then(function(r) {
        return r.data.user;
      });
    },

    /** Sign up with email + password */
    signUp: function(email, password, metadata) {
      if (!client) return Promise.reject(new Error("Supabase not configured"));
      return client.auth.signUp({
        email: email,
        password: password,
        options: { data: metadata || {} }
      });
    },

    /** Sign in with email + password */
    signIn: function(email, password) {
      if (!client) return Promise.reject(new Error("Supabase not configured"));
      return client.auth.signInWithPassword({
        email: email,
        password: password
      });
    },

    /** Sign out */
    signOut: function() {
      if (!client) return Promise.resolve();
      return client.auth.signOut();
    },

    /** Send password reset email */
    resetPassword: function(email) {
      if (!client) return Promise.reject(new Error("Supabase not configured"));
      return client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login/"
      });
    },

    /** Listen for auth state changes */
    onAuthStateChange: function(callback) {
      if (!client) return { data: { subscription: { unsubscribe: function() {} } } };
      return client.auth.onAuthStateChange(callback);
    },

    /** Update password (requires active session) */
    updatePassword: function(newPassword) {
      if (!client) return Promise.reject(new Error("Supabase not configured"));
      return client.auth.updateUser({ password: newPassword });
    },

    /** Check if user is logged in */
    isLoggedIn: function() {
      return auth.getSession().then(function(s) { return !!s; });
    }
  };

  /* ── Expose globally ── */
  window.sbClient = client;
  window.sbAuth = auth;

  /* ── Convenience: is Supabase available? ── */
  window.sbReady = !!client;

})();

/* ─── Supabase Data Layer ─────────────────────────────────────────────────── */
/* Wraps all CRUD operations. Falls back to localStorage when Supabase       */
/* is not configured (local development / offline mode).                      */
/* Provides: window.db                                                       */

(function() {
  "use strict";

  /* ── localStorage keys (fallback) ── */
  var LS = {
    profile:  "glossio_profile",
    services: "glossio_services",
    photos:   "glossio_work_photos",
    clients:  "glossio_clients",
    appts:    "glossio_appointments",
    settings: "glossio_settings"
  };

  function lsGet(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch(e) { return null; }
  }
  function lsSet(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /* ── Check if Supabase is available ── */
  function sb() { return window.sbClient; }
  function userId() {
    if (!sb()) return null;
    return window.__glossio_user_id || null;
  }

  /* ── Auth readiness gate ── */
  /* All db methods wait for this promise so userId() is always set before
     we decide whether to use Supabase or fall back to localStorage.        */
  var _authReady;
  if (window.sbAuth) {
    _authReady = new Promise(function(resolve) {
      /* onAuthStateChange fires once immediately with current session */
      var resolved = false;
      window.sbAuth.onAuthStateChange(function(event, session) {
        window.__glossio_user_id = session && session.user ? session.user.id : null;
        if (!resolved) { resolved = true; resolve(); }
      });
      /* Also try getSession (returns { data: { session } }) as backup */
      window.sbAuth.getSession().then(function(result) {
        var s = result && result.data ? result.data.session : null;
        if (s && s.user) window.__glossio_user_id = s.user.id;
        if (!resolved) { resolved = true; resolve(); }
      }).catch(function() {
        if (!resolved) { resolved = true; resolve(); }
      });
      /* Safety timeout — never block the UI for more than 2 seconds */
      setTimeout(function() {
        if (!resolved) { resolved = true; resolve(); }
      }, 2000);
    });
  } else {
    _authReady = Promise.resolve();
  }

  /* Helper: wrap a function so it waits for auth before running */
  function afterAuth(fn) {
    return function() {
      var args = arguments;
      var self = this;
      return _authReady.then(function() {
        return fn.apply(self, args);
      });
    };
  }

  /* ────────────────────────────────────────────────────────────────────────── */
  /* ── Profile ──                                                             */
  /* ────────────────────────────────────────────────────────────────────────── */

  var profile = {
    /** Get current user's profile */
    get: afterAuth(function() {
      if (sb() && userId()) {
        return sb().from("profiles").select("*").eq("id", userId()).single()
          .then(function(r) { return r.data; });
      }
      return Promise.resolve(lsGet(LS.profile) || {});
    }),

    /** Update profile fields */
    update: afterAuth(function(fields) {
      if (sb() && userId()) {
        return sb().from("profiles").update(fields).eq("id", userId())
          .then(function(r) { return r.data; });
      }
      var p = lsGet(LS.profile) || {};
      Object.assign(p, fields);
      lsSet(LS.profile, p);
      return Promise.resolve(p);
    }),

    /** Get public profile by slug */
    getBySlug: function(slug) {
      if (sb()) {
        return sb().from("profiles").select("*").eq("slug", slug).single()
          .then(function(r) { return r.data; });
      }
      var p = lsGet(LS.profile) || {};
      return Promise.resolve(p);
    }
  };

  /* ────────────────────────────────────────────────────────────────────────── */
  /* ── Services ──                                                            */
  /* ────────────────────────────────────────────────────────────────────────── */

  var services = {
    /** Get all services for current user */
    list: afterAuth(function() {
      if (sb() && userId()) {
        return sb().from("services").select("*")
          .eq("profile_id", userId())
          .order("sort_order", { ascending: true })
          .then(function(r) { return r.data || []; });
      }
      return Promise.resolve(lsGet(LS.services) || []);
    }),

    /** Get active services for a profile (public) */
    listByProfile: function(profileId) {
      if (sb()) {
        return sb().from("services").select("*")
          .eq("profile_id", profileId)
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .then(function(r) { return r.data || []; });
      }
      return Promise.resolve(lsGet(LS.services) || []);
    },

    /** Create a service */
    create: afterAuth(function(data) {
      if (sb() && userId()) {
        data.profile_id = userId();
        return sb().from("services").insert(data).select().single()
          .then(function(r) { return r.data; });
      }
      var list = lsGet(LS.services) || [];
      data.id = data.id || uuid();
      list.push(data);
      lsSet(LS.services, list);
      return Promise.resolve(data);
    }),

    /** Update a service */
    update: afterAuth(function(id, fields) {
      if (sb() && userId()) {
        return sb().from("services").update(fields).eq("id", id).eq("profile_id", userId())
          .then(function(r) { return r.data; });
      }
      var list = lsGet(LS.services) || [];
      list = list.map(function(s) { return s.id === id ? Object.assign(s, fields) : s; });
      lsSet(LS.services, list);
      return Promise.resolve(fields);
    }),

    /** Delete a service */
    remove: afterAuth(function(id) {
      if (sb() && userId()) {
        return sb().from("services").delete().eq("id", id).eq("profile_id", userId());
      }
      var list = (lsGet(LS.services) || []).filter(function(s) { return s.id !== id; });
      lsSet(LS.services, list);
      return Promise.resolve();
    })
  };

  /* ────────────────────────────────────────────────────────────────────────── */
  /* ── Work Photos ──                                                         */
  /* ────────────────────────────────────────────────────────────────────────── */

  var photos = {
    list: afterAuth(function() {
      if (sb() && userId()) {
        return sb().from("work_photos").select("*")
          .eq("profile_id", userId())
          .order("sort_order", { ascending: true })
          .then(function(r) { return r.data || []; });
      }
      return Promise.resolve(lsGet(LS.photos) || []);
    }),

    listByProfile: function(profileId) {
      if (sb()) {
        return sb().from("work_photos").select("*")
          .eq("profile_id", profileId)
          .order("sort_order", { ascending: true })
          .then(function(r) { return r.data || []; });
      }
      return Promise.resolve(lsGet(LS.photos) || []);
    },

    create: afterAuth(function(data) {
      if (sb() && userId()) {
        data.profile_id = userId();
        return sb().from("work_photos").insert(data).select().single()
          .then(function(r) { return r.data; });
      }
      var list = lsGet(LS.photos) || [];
      data.id = data.id || uuid();
      list.push(data);
      lsSet(LS.photos, list);
      return Promise.resolve(data);
    }),

    remove: afterAuth(function(id) {
      if (sb() && userId()) {
        return sb().from("work_photos").delete().eq("id", id).eq("profile_id", userId());
      }
      var list = (lsGet(LS.photos) || []).filter(function(p) { return p.id !== id; });
      lsSet(LS.photos, list);
      return Promise.resolve();
    })
  };

  /* ────────────────────────────────────────────────────────────────────────── */
  /* ── Clients ──                                                             */
  /* ────────────────────────────────────────────────────────────────────────── */

  var clients = {
    list: afterAuth(function() {
      if (sb() && userId()) {
        return sb().from("client_stats").select("*")
          .eq("profile_id", userId())
          .then(function(r) { return r.data || []; });
      }
      return Promise.resolve(lsGet(LS.clients) || []);
    }),

    get: afterAuth(function(id) {
      if (sb() && userId()) {
        return sb().from("client_stats").select("*")
          .eq("id", id).eq("profile_id", userId()).single()
          .then(function(r) { return r.data; });
      }
      var list = lsGet(LS.clients) || [];
      return Promise.resolve(list.find(function(c) { return c.id === id; }) || null);
    }),

    create: afterAuth(function(data) {
      if (sb() && userId()) {
        data.profile_id = userId();
        return sb().from("clients").insert(data).select().single()
          .then(function(r) { return r.data; });
      }
      var list = lsGet(LS.clients) || [];
      data.id = data.id || uuid();
      data.created_at = data.created_at || new Date().toISOString();
      list.push(data);
      lsSet(LS.clients, list);
      return Promise.resolve(data);
    }),

    update: afterAuth(function(id, fields) {
      if (sb() && userId()) {
        return sb().from("clients").update(fields).eq("id", id).eq("profile_id", userId())
          .then(function(r) { return r.data; });
      }
      var list = lsGet(LS.clients) || [];
      list = list.map(function(c) { return c.id === id ? Object.assign(c, fields) : c; });
      lsSet(LS.clients, list);
      return Promise.resolve(fields);
    }),

    remove: afterAuth(function(id) {
      if (sb() && userId()) {
        return sb().from("clients").delete().eq("id", id).eq("profile_id", userId());
      }
      var list = (lsGet(LS.clients) || []).filter(function(c) { return c.id !== id; });
      lsSet(LS.clients, list);
      return Promise.resolve();
    })
  };

  /* ────────────────────────────────────────────────────────────────────────── */
  /* ── Appointments ──                                                        */
  /* ────────────────────────────────────────────────────────────────────────── */

  var appointments = {
    list: afterAuth(function() {
      if (sb() && userId()) {
        return sb().from("appointments").select("*")
          .eq("profile_id", userId())
          .order("scheduled_date", { ascending: true })
          .then(function(r) { return r.data || []; });
      }
      return Promise.resolve(lsGet(LS.appts) || []);
    }),

    get: afterAuth(function(id) {
      if (sb() && userId()) {
        return sb().from("appointments").select("*")
          .eq("id", id).eq("profile_id", userId()).single()
          .then(function(r) { return r.data; });
      }
      var list = lsGet(LS.appts) || [];
      return Promise.resolve(list.find(function(a) { return a.id === id; }) || null);
    }),

    create: afterAuth(function(data) {
      if (sb() && userId()) {
        data.profile_id = userId();
        return sb().from("appointments").insert(data).select().single()
          .then(function(r) { return r.data; });
      }
      var list = lsGet(LS.appts) || [];
      data.id = data.id || uuid();
      data.created_at = data.created_at || new Date().toISOString();
      list.push(data);
      lsSet(LS.appts, list);
      return Promise.resolve(data);
    }),

    /** Update appointment status or fields */
    update: afterAuth(function(id, fields) {
      if (sb() && userId()) {
        return sb().from("appointments").update(fields).eq("id", id).eq("profile_id", userId())
          .then(function(r) { return r.data; });
      }
      var list = lsGet(LS.appts) || [];
      list = list.map(function(a) { return a.id === id ? Object.assign(a, fields) : a; });
      lsSet(LS.appts, list);
      return Promise.resolve(fields);
    }),

    remove: afterAuth(function(id) {
      if (sb() && userId()) {
        return sb().from("appointments").delete().eq("id", id).eq("profile_id", userId());
      }
      var list = (lsGet(LS.appts) || []).filter(function(a) { return a.id !== id; });
      lsSet(LS.appts, list);
      return Promise.resolve();
    })
  };

  /* ────────────────────────────────────────────────────────────────────────── */
  /* ── Settings (Business Hours, Availability, Notifications) ──              */
  /* ────────────────────────────────────────────────────────────────────────── */

  var settings = {
    /** Get merged settings (business hours + availability + notifications) */
    get: afterAuth(function() {
      if (sb() && userId()) {
        return Promise.all([
          sb().from("business_hours").select("*").eq("profile_id", userId()).order("day_of_week"),
          sb().from("availability_settings").select("*").eq("profile_id", userId()).single(),
          sb().from("availability_blocks").select("*").eq("profile_id", userId()),
          sb().from("notification_settings").select("*").eq("profile_id", userId()).single()
        ]).then(function(results) {
          return {
            businessHours: results[0].data || [],
            availability: results[1].data || {},
            blocks: results[2].data || [],
            notifications: results[3].data || {}
          };
        });
      }
      return Promise.resolve(lsGet(LS.settings) || {});
    }),

    /** Update business hours for a day */
    updateHours: afterAuth(function(dayOfWeek, fields) {
      if (sb() && userId()) {
        return sb().from("business_hours").update(fields)
          .eq("profile_id", userId())
          .eq("day_of_week", dayOfWeek);
      }
      var s = lsGet(LS.settings) || {};
      if (!s.hours) s.hours = {};
      s.hours[dayOfWeek] = Object.assign(s.hours[dayOfWeek] || {}, fields);
      lsSet(LS.settings, s);
      return Promise.resolve();
    }),

    /** Update availability settings */
    updateAvailability: afterAuth(function(fields) {
      if (sb() && userId()) {
        return sb().from("availability_settings").upsert(
          Object.assign({ profile_id: userId() }, fields)
        );
      }
      var s = lsGet(LS.settings) || {};
      Object.assign(s, fields);
      lsSet(LS.settings, s);
      return Promise.resolve();
    }),

    /** Add availability block (vacation) */
    addBlock: afterAuth(function(data) {
      if (sb() && userId()) {
        data.profile_id = userId();
        return sb().from("availability_blocks").insert(data).select().single()
          .then(function(r) { return r.data; });
      }
      var s = lsGet(LS.settings) || {};
      if (!s.blocks) s.blocks = [];
      data.id = data.id || uuid();
      s.blocks.push(data);
      lsSet(LS.settings, s);
      return Promise.resolve(data);
    }),

    /** Remove availability block */
    removeBlock: afterAuth(function(id) {
      if (sb() && userId()) {
        return sb().from("availability_blocks").delete().eq("id", id).eq("profile_id", userId());
      }
      var s = lsGet(LS.settings) || {};
      s.blocks = (s.blocks || []).filter(function(b) { return b.id !== id; });
      lsSet(LS.settings, s);
      return Promise.resolve();
    }),

    /** Update notification settings */
    updateNotifications: afterAuth(function(fields) {
      if (sb() && userId()) {
        return sb().from("notification_settings").upsert(
          Object.assign({ profile_id: userId() }, fields)
        );
      }
      var s = lsGet(LS.settings) || {};
      Object.assign(s, fields);
      lsSet(LS.settings, s);
      return Promise.resolve();
    }),

    /** Save all settings at once (localStorage mode) */
    saveAll: afterAuth(function(data) {
      if (sb() && userId()) {
        /* For Supabase mode, use individual update methods */
        return Promise.resolve();
      }
      lsSet(LS.settings, data);
      return Promise.resolve();
    })
  };

  /* ────────────────────────────────────────────────────────────────────────── */
  /* ── Storage (file uploads) ──                                              */
  /* ────────────────────────────────────────────────────────────────────────── */

  var ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  var MAX_FILE_SIZE = 10 * 1024 * 1024; /* 10 MB */

  var storage = {
    /** Upload a file to Supabase Storage (with validation) */
    upload: function(bucket, path, file) {
      if (!sb()) return Promise.reject(new Error("Supabase not configured"));
      if (!file || !file.size) return Promise.reject(new Error("No file provided"));
      if (file.size > MAX_FILE_SIZE) return Promise.reject(new Error("File too large. Maximum size is 10 MB."));
      if (ALLOWED_IMAGE_TYPES.indexOf(file.type) === -1) {
        return Promise.reject(new Error("Invalid file type. Allowed: JPEG, PNG, WebP, HEIC."));
      }
      return sb().storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: true
      });
    },

    /** Get public URL for a file */
    getPublicUrl: function(bucket, path) {
      if (!sb()) return "";
      return sb().storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },

    /** Delete a file */
    remove: function(bucket, paths) {
      if (!sb()) return Promise.resolve();
      return sb().storage.from(bucket).remove(paths);
    }
  };

  /* ── Expose globally ── */
  window.db = {
    profile: profile,
    services: services,
    photos: photos,
    clients: clients,
    appointments: appointments,
    settings: settings,
    storage: storage,
    isOnline: function() { return !!sb() && !!userId(); },
    ready: _authReady
  };

})();

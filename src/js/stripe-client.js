/* ─── Stripe Client-Side Integration ──────────────────────────────────────── */
/* Loaded on pages that need Stripe (settings/billing).                       */
/* Requires Stripe.js CDN to be loaded first.                                 */

(function() {
  "use strict";

  var stripeKey = window.__GLOSSIO_STRIPE_KEY || "";
  var stripeInstance = null;

  if (stripeKey && window.Stripe) {
    stripeInstance = window.Stripe(stripeKey);
  }

  window.glossioStripe = {
    /** Redirect to Stripe Checkout for subscription */
    checkout: function(priceId) {
      if (!window.sbReady) {
        alert("Please log in first.");
        return Promise.reject(new Error("Not logged in"));
      }

      return window.sbAuth.getUser().then(function(user) {
        if (!user) throw new Error("Not logged in");

        return window.api.call("stripe-checkout", {
          priceId: priceId,
          profileId: user.id,
          email: user.email
        });
      }).then(function(data) {
        if (data.url) {
          window.location.href = data.url;
        } else if (data.sessionId && stripeInstance) {
          return stripeInstance.redirectToCheckout({ sessionId: data.sessionId });
        }
      });
    },

    /** Fetch invoices from Stripe */
    getInvoices: function() {
      return window.db.profile.get().then(function(profile) {
        if (!profile || !profile.stripe_customer_id) {
          return [];
        }
        return window.api.call("stripe-invoices", { customerId: profile.stripe_customer_id });
      }).then(function(data) {
        return (data && data.invoices) || [];
      }).catch(function() { return []; });
    },

    /** Cancel subscription via Stripe */
    cancelSubscription: function() {
      return window.db.profile.get().then(function(profile) {
        if (!profile || !profile.stripe_customer_id) {
          throw new Error("No billing account found");
        }
        return window.api.call("stripe-cancel", { customerId: profile.stripe_customer_id });
      });
    },

    /** Open Stripe Billing Portal */
    openPortal: function() {
      return window.db.profile.get().then(function(profile) {
        if (!profile || !profile.stripe_customer_id) {
          alert("No billing account found. Subscribe first.");
          return;
        }

        return window.api.call("stripe-portal", { customerId: profile.stripe_customer_id });
      }).then(function(data) {
        if (data && data.url) {
          window.location.href = data.url;
        }
      });
    }
  };

})();

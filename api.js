// api.js — shared JSONP helper for talking to the Apps Script backend.
// Used by both index.html (entry form) and dashboard.html (reporting).
// Depends on SCRIPT_URL and API_KEY from config.js — load that first.
//
// This used to be copy-pasted inline in index.html. Pulled out into its
// own file for the same reason config.js was split out: two copies of the
// same logic drift apart the first time one gets updated and the other
// doesn't. Now there's exactly one copy, loaded by every page that needs it.

function callApi(action, params) {
  return new Promise(function(resolve) {
    const callbackName = 'cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const url = new URL(SCRIPT_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('callback', callbackName);
    url.searchParams.set('key', API_KEY);
    Object.entries(params || {}).forEach(function(entry) {
      const k = entry[0], v = entry[1];
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });

    window[callbackName] = function(data) {
      delete window[callbackName];
      script.remove();
      resolve(data);
    };

    const script = document.createElement('script');
    script.src = url.toString();
    script.onerror = function() {
      delete window[callbackName];
      script.remove();
      resolve({ status: 'error', message: 'Could not reach the sheet backend. Check config.js and your connection.' });
    };
    document.body.appendChild(script);
  });
}

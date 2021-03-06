const VERSION = "1.0.0";
const CACHE = "aplikasi-rahmatagungj-offline-" + VERSION;

const offlineFallbackPage = "index.html";

// Install stage sets up the index page (home page) in the cache and opens a new cache
self.addEventListener("install", function (event) {
  // console.log("Install Event processing");

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // console.log("Cached offline page during install");

      if (offlineFallbackPage === "to-do.html") {
        return cache.add(
          new Response(
            "Update the value of the offlineFallbackPage constant in the serviceworker."
          )
        );
      }

      return cache.add(offlineFallbackPage);
    })
  );
});

function onInstall(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function prefill(cache) {
      return cache.addAll(["/"]);
    })
  );
}

function onActivate(event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            return cacheName.indexOf(VERSION) !== 0;
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
}

self.addEventListener("activate", onActivate);

self.addEventListener("install", onInstall);

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // console.log("Add page to offline cache: " + response.url);

        // If request was success, add or update it in the cache
        event.waitUntil(updateCache(event.request, response.clone()));

        return response;
      })
      .catch(function (error) {
        // console.log("Network request Failed. Serving content from cache: " + error);
        return fromCache(event.request);
      })
  );
});

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return error page
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}

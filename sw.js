// Složi reč: čuva igru na telefonu da radi i bez interneta
var KES = "slozi-rec-v1";
var FAJLOVI = ["./", "./index.html", "./manifest.webmanifest", "./ikona-192.png", "./ikona-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(KES).then(function (c) { return c.addAll(FAJLOVI); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (kljucevi) {
    return Promise.all(kljucevi.filter(function (k) { return k !== KES; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  // Stranica: prvo sa interneta (da stigne nova verzija), a bez interneta iz memorije
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (odg) {
      var kopija = odg.clone();
      caches.open(KES).then(function (c) { c.put("./index.html", kopija); });
      return odg;
    }).catch(function () { return caches.match("./index.html"); }));
    return;
  }
  // Ostalo (ikone, slova sa Google Fonts): prvo iz memorije
  e.respondWith(caches.match(req).then(function (sacuvano) {
    return sacuvano || fetch(req).then(function (odg) {
      var kopija = odg.clone();
      caches.open(KES).then(function (c) { c.put(req, kopija); });
      return odg;
    });
  }));
});

// ==UserScript==
// @name         LyricsBilingual Now Playing Reporter
// @namespace    lyricsbilingual
// @version      3.1
// @description  Reports the currently playing track (via the Media Session API) on open.spotify.com to a local LyricsBilingual instance
// @match        https://open.spotify.com/*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// ==/UserScript==

(function () {
  "use strict";

  const REPORT_URL = "http://127.0.0.1:3000/api/now-playing/report";
  const POLL_MS = 3000;

  function readNowPlaying() {
    const metadata = navigator.mediaSession && navigator.mediaSession.metadata;
    if (!metadata) return null;

    const title = metadata.title?.trim();
    const artist = metadata.artist?.trim();
    if (!title || !artist) return null;

    return { title, artist };
  }

  function tick() {
    const track = readNowPlaying();
    if (!track) return;

    GM_xmlhttpRequest({
      method: "POST",
      url: REPORT_URL,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(track),
      onerror: (err) => console.error("[LyricsBilingual] report failed", err),
    });
  }

  setInterval(tick, POLL_MS);
  tick();
})();

/*
  VZN — Vision Studio Co. portfolio
  ---------------------------------
  Two lists: SOUND (beats, mixes) and VISUAL (artwork, cover art, videos).
  On the site they sit side by side and scrolling moves sideways from one to
  the other. Items appear in the order listed, grouped under their "type"
  (each new type starts a new group, e.g. all "Beat" items, then all "Mix").

  SOUND fields
    title     Track name.
    type      Group label, e.g. "Beat", "Mix & Master".
    artist    Artist / client (optional).
    bpm, key  Shown on the card when filled in (optional).
    length    Running time, e.g. "0:34" (optional).
    year      Year as text (optional).
    cover     Square cover image, e.g. "assets/media/sound/my-beat.jpg" (optional —
              without one the card shows the track's waveform).
    peaks     48 numbers from 0 to 1: the waveform drawn on the cover (optional).
    media     What the play button plays (optional):
                { kind: "audio",      src: "assets/media/audio/my-beat.mp3" }   plays on the card
                { kind: "soundcloud", src: "https://soundcloud.com/artist/track" }
                { kind: "spotify",    src: "https://open.spotify.com/track/..." }
                { kind: "youtube",    src: "VIDEO_ID or full URL" }
              Links open in a player window. Without media the card says "Soon".

  VISUAL fields
    title     Piece name.
    type      Group label, e.g. "Poster", "Cover Art", "Music Video".
    client    Artist / client (optional).
    year      Year as text (optional).
    image     The artwork on the card, about 800 px wide, e.g. "assets/media/visual/cover.jpg".
    full      A larger version (about 1600 px) shown when the piece is opened (optional).
              Keep full-size originals in assets/media/originals; they aren't loaded.
    ratio     Its proportions, e.g. "1 / 1" or "4 / 5" (optional; square is assumed
              until the image loads, so filling it in avoids a small jump).
    media     Optional video shown when the piece is opened:
                { kind: "youtube", src: "..." } / { kind: "vimeo", src: "..." } /
                { kind: "video", src: "assets/media/clip.mp4" }
    description  A sentence shown when the piece is opened (optional).
*/
window.VZN_PORTFOLIO = {
  sound: [
    {
      title: "Angel Feathers", type: "Beat", bpm: "114", length: "0:34",
      media: { kind: "audio", src: "assets/media/audio/angel-feathers.mp3" },
      peaks: [0.35,0.38,0.37,0.33,0.34,0.32,0.36,0.4,0.4,0.37,0.41,0.4,0.35,0.37,0.37,0.33,0.32,0.33,0.28,0.32,0.34,0.37,0.35,0.15,0.75,0.4,0.37,0.71,0.38,0.73,0.75,0.44,0.4,0.99,0.7,0.85,0.76,0.41,0.37,0.73,0.39,0.72,0.73,0.36,0.33,1.0,0.71,0.86]
    },
    {
      title: "Feedback Interrupted", type: "Beat", bpm: "133", length: "0:38",
      media: { kind: "audio", src: "assets/media/audio/feedback-interrupted.mp3" },
      peaks: [0.38,0.35,0.36,0.27,0.35,0.34,0.37,0.37,0.38,0.35,0.38,0.27,0.35,0.36,0.35,0.39,0.36,0.35,0.36,0.28,0.36,0.35,0.38,0.39,0.37,0.35,0.38,0.31,0.34,0.35,0.38,0.39,0.99,0.79,0.8,0.92,0.89,0.65,0.37,0.38,1.0,0.79,0.81,0.93,0.88,0.65,0.34,0.39]
    },
    {
      title: "Topspin", type: "Beat", bpm: "130", length: "0:30",
      media: { kind: "audio", src: "assets/media/audio/topspin.mp3" },
      peaks: [0.24,0.22,0.2,0.21,0.2,0.18,0.25,0.22,0.21,0.21,0.2,0.17,0.24,0.23,0.22,0.21,0.19,0.18,0.26,0.24,0.21,0.23,0.27,0.3,1.0,0.86,0.92,0.86,0.91,0.96,0.98,0.79,0.89,0.86,0.89,0.99,0.99,0.86,0.92,0.86,0.91,0.96,0.98,0.79,0.89,0.87,0.89,0.95]
    },
    {
      title: "Two Step", type: "Beat", bpm: "128", length: "0:30",
      media: { kind: "audio", src: "assets/media/audio/two-step.mp3" },
      peaks: [0.33,0.29,0.33,0.16,0.17,0.1,0.45,0.39,0.41,0.15,0.17,0.1,0.34,0.28,0.31,0.15,0.17,0.1,0.44,0.4,0.37,0.33,0.31,0.27,0.96,0.83,0.77,0.44,0.17,0.38,1.0,0.82,0.85,0.46,0.92,0.89,0.92,0.83,0.77,0.44,0.18,0.38,0.96,0.83,0.84,0.51,0.94,0.9]
    },
    {
      title: "Voxelize", type: "Beat", bpm: "125", length: "0:31",
      media: { kind: "audio", src: "assets/media/audio/voxelize.mp3" },
      peaks: [0.94,0.47,0.39,0.91,0.36,0.4,0.87,0.48,0.44,0.92,0.41,0.17,0.94,0.42,0.41,0.91,0.37,0.38,0.87,0.51,0.31,0.89,0.56,0.5,0.97,0.64,0.54,0.99,0.55,0.38,0.92,0.69,0.38,0.98,0.57,0.16,0.99,0.63,0.57,1.0,0.54,0.48,0.95,0.71,0.45,0.99,0.55,0.15]
    },
    {
      title: "Wanderer", type: "Beat", bpm: "122", length: "0:32",
      media: { kind: "audio", src: "assets/media/audio/wanderer.mp3" },
      peaks: [0.62,0.29,0.18,0.62,0.26,0.42,0.81,0.28,0.18,0.62,0.26,1.0,0.57,0.28,0.18,0.62,0.24,0.43,0.81,0.29,0.18,0.62,0.24,0.83,0.71,0.32,0.68,0.66,0.25,0.14,0.84,0.72,0.58,0.84,0.26,0.84,0.73,0.32,0.42,0.78,0.25,0.14,0.84,0.6,0.7,0.64,0.24,0.84]
    },
    {
      title: "Lambo Long", type: "Beat", bpm: "141", length: "1:39",
      media: { kind: "audio", src: "assets/media/audio/lambo-long.mp3" },
      peaks: [0.27,0.23,0.25,0.24,0.26,0.28,0.63,0.67,0.85,0.62,0.63,1.0,0.35,0.66,0.9,0.57,0.78,0.75,0.8,0.28,0.28,0.22,0.22,0.24,0.23,0.28,0.64,0.76,0.74,0.72,0.66,0.93,0.3,0.66,0.58,0.45,0.79,0.74,0.68,0.59,0.37,0.64,0.45,0.65,0.59,0.49,0.26,0.06]
    }
  ],

  visual: [
    {
      title: "Snake Eyes", type: "Poster", ratio: "1 / 1",
      image: "assets/media/visual/snake-eyes.jpg", full: "assets/media/visual/snake-eyes-large.jpg",
      description: "Better luck next time."
    },
    {
      title: "Staring at the Sun", type: "Poster", ratio: "1 / 1",
      image: "assets/media/visual/staring-at-the-sun.jpg", full: "assets/media/visual/staring-at-the-sun-large.jpg",
      description: "Stared at the sun so long it started staring back."
    }
  ]
};

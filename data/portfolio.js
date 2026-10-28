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
    year      Year as text.
    cover     Square cover image, e.g. "assets/media/sound/my-beat.jpg" (optional —
              a generated cover is used when empty).
    media     What the play button plays (optional):
                { kind: "audio",      src: "assets/media/audio/my-beat.mp3" }   plays on the card
                { kind: "soundcloud", src: "https://soundcloud.com/artist/track" }
                { kind: "spotify",    src: "https://open.spotify.com/track/..." }
                { kind: "youtube",    src: "VIDEO_ID or full URL" }
              Links open in a player window. Without media the card says "Soon".

  VISUAL fields
    title     Piece name.
    type      Group label, e.g. "Cover Art", "Artwork", "Music Video".
    client    Artist / client (optional).
    year      Year as text.
    image     The artwork, e.g. "assets/media/visual/cover.jpg" (optional —
              a generated placeholder is used when empty).
    media     Optional video shown when the piece is opened:
                { kind: "youtube", src: "..." } / { kind: "vimeo", src: "..." } /
                { kind: "video", src: "assets/media/clip.mp4" }
    description  A sentence shown when the piece is opened (optional).

  The entries below are placeholders — replace them with real work.
*/
window.VZN_PORTFOLIO = {
  sound: [
    { title: "Untitled Beat 01", type: "Beat", bpm: "140", key: "F minor", year: "2026", cover: "", media: null },
    { title: "Untitled Beat 02", type: "Beat", bpm: "92", key: "C minor", year: "2026", cover: "", media: null },
    { title: "Untitled Beat 03", type: "Beat", bpm: "128", year: "2026", cover: "", media: null },
    { title: "Untitled Beat 04", type: "Beat", bpm: "75", year: "2025", cover: "", media: null },
    { title: "Song Title", type: "Mix & Master", artist: "Artist Name", year: "2026", cover: "", media: null },
    { title: "Song Title", type: "Mix & Master", artist: "Artist Name", year: "2025", cover: "", media: null },
    { title: "EP Title", type: "Mix & Master", artist: "Artist Name", year: "2025", cover: "", media: null }
  ],

  visual: [
    { title: "Single Cover", type: "Cover Art", client: "Artist Name", year: "2026", image: "", description: "Placeholder — cover art for a single." },
    { title: "EP Cover", type: "Cover Art", client: "Artist Name", year: "2026", image: "", description: "Placeholder — cover art for an EP." },
    { title: "Album Cover", type: "Cover Art", client: "Artist Name", year: "2025", image: "", description: "Placeholder — album artwork." },
    { title: "Poster Series", type: "Artwork", client: "", year: "2025", image: "", description: "Placeholder — personal artwork." },
    { title: "Logo Mark", type: "Artwork", client: "Brand Name", year: "2025", image: "", description: "Placeholder — logo and visual identity." },
    { title: "Video Title", type: "Music Video", client: "Artist Name", year: "2025", image: "", media: null, description: "Placeholder — music video." }
  ]
};

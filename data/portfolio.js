/*
  VZN Studios portfolio
  ---------------------
  Add, remove or reorder projects here. Items show on the site in this order.

  Fields
    title        Project name.
    category     "audio" or "visual" (drives the filter tabs).
    type         Short label shown on the card, e.g. "Single", "Music Video".
    year         Year as text.
    client       Artist / brand (optional).
    description  One or two sentences shown in the viewer.
    thumbnail    Path to an image in assets/media/thumbs/ (optional — a
                 generated cover is used when empty).
    tags         List of short labels (optional).
    media        What plays/opens in the viewer (optional):
                   { kind: "youtube",    src: "VIDEO_ID or full URL" }
                   { kind: "vimeo",      src: "VIDEO_ID or full URL" }
                   { kind: "soundcloud", src: "https://soundcloud.com/artist/track" }
                   { kind: "spotify",    src: "https://open.spotify.com/track/..." }
                   { kind: "audio",      src: "assets/media/audio/file.mp3" }
                   { kind: "video",      src: "assets/media/file.mp4" }
                   { kind: "image",      src: "assets/media/file.jpg" }

  The entries below are placeholders — replace them with real work.
*/
window.VZN_PORTFOLIO = [
  {
    title: "Project Title",
    category: "visual",
    type: "Music Video",
    year: "2026",
    client: "Artist Name",
    description: "Placeholder — concept, direction, shoot and edit for a single release.",
    thumbnail: "",
    tags: ["Direction", "Edit", "Colour"],
    media: null
  },
  {
    title: "Track Title",
    category: "audio",
    type: "Single",
    year: "2026",
    client: "Artist Name",
    description: "Placeholder — production, mixing and mastering.",
    thumbnail: "",
    tags: ["Production", "Mix", "Master"],
    media: null
  },
  {
    title: "Campaign Name",
    category: "visual",
    type: "Photography",
    year: "2026",
    client: "Brand Name",
    description: "Placeholder — press photography and cover art.",
    thumbnail: "",
    tags: ["Photo", "Cover Art"],
    media: null
  },
  {
    title: "EP Title",
    category: "audio",
    type: "EP",
    year: "2025",
    client: "Artist Name",
    description: "Placeholder — five-track EP, produced and mixed in-house.",
    thumbnail: "",
    tags: ["Production", "Mix"],
    media: null
  },
  {
    title: "Brand Film",
    category: "visual",
    type: "Short Film",
    year: "2025",
    client: "Brand Name",
    description: "Placeholder — short brand film with original score.",
    thumbnail: "",
    tags: ["Film", "Score"],
    media: null
  },
  {
    title: "Sonic Logo",
    category: "audio",
    type: "Sound Design",
    year: "2025",
    client: "Brand Name",
    description: "Placeholder — sonic branding and sound design package.",
    thumbnail: "",
    tags: ["Sound Design"],
    media: null
  }
];

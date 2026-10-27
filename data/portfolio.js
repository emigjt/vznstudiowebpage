/*
  VZN — Vision Studio Co. portfolio
  ---------------------------------
  Add, remove or reorder projects here. They appear in the "Selected Works"
  list in this order; the first one is shown when the page loads.

  Fields
    title        Project name (shown in the list).
    category     "audio" or "visual" (drives the filter).
    type         e.g. "Single", "EP", "Music Video", "Photography".
    year         Year as text, e.g. "2026" or "2025–ongoing".
    client       Artist / brand (optional).
    role         What VZN did, e.g. "Production, Mix, Master" (optional).
    status       e.g. "Released", "Out soon" (optional).
    description  A sentence or two about the project (optional).
    images       Gallery shown beside the list, e.g.
                   ["assets/media/my-project/cover.jpg", "assets/media/my-project/still-1.jpg"]
                 Leave empty to show generated placeholder covers.
    media        Player shown above the images (optional):
                   { kind: "youtube",    src: "VIDEO_ID or full URL" }
                   { kind: "vimeo",      src: "VIDEO_ID or full URL" }
                   { kind: "soundcloud", src: "https://soundcloud.com/artist/track" }
                   { kind: "spotify",    src: "https://open.spotify.com/track/..." }
                   { kind: "audio",      src: "assets/media/audio/file.mp3" }
                   { kind: "video",      src: "assets/media/file.mp4" }

  The entries below are placeholders — replace them with real work.
*/
window.VZN_PORTFOLIO = [
  {
    title: "Music Video Title",
    category: "visual",
    type: "Music Video",
    year: "2026",
    client: "Artist Name",
    role: "Direction, Shoot, Edit, Colour",
    status: "Released",
    description: "Placeholder — concept, direction, shoot and edit for a single release.",
    images: [],
    media: null
  },
  {
    title: "Single Title",
    category: "audio",
    type: "Single",
    year: "2026",
    client: "Artist Name",
    role: "Production, Mix, Master",
    status: "Released",
    description: "Placeholder — production, mixing and mastering.",
    images: [],
    media: null
  },
  {
    title: "Campaign Name",
    category: "visual",
    type: "Photography",
    year: "2026",
    client: "Brand Name",
    role: "Photography, Art Direction",
    description: "Placeholder — press photography and cover art.",
    images: [],
    media: null
  },
  {
    title: "EP Title",
    category: "audio",
    type: "EP",
    year: "2025",
    client: "Artist Name",
    role: "Production, Recording, Mix",
    status: "Released",
    description: "Placeholder — five-track EP, produced and mixed in-house.",
    images: [],
    media: null
  },
  {
    title: "Brand Film",
    category: "visual",
    type: "Short Film",
    year: "2025",
    client: "Brand Name",
    role: "Direction, Edit, Original Score",
    description: "Placeholder — short brand film with original score.",
    images: [],
    media: null
  },
  {
    title: "Sonic Identity",
    category: "audio",
    type: "Sound Design",
    year: "2025",
    client: "Brand Name",
    role: "Sound Design, Sonic Branding",
    description: "Placeholder — sonic logo and sound design package.",
    images: [],
    media: null
  },
  {
    title: "Cover Art Series",
    category: "visual",
    type: "Art Direction",
    year: "2025–ongoing",
    client: "Artist Name",
    role: "Cover Art, Visual Identity",
    status: "Ongoing",
    description: "Placeholder — cover art and visual identity across a release cycle.",
    images: [],
    media: null
  },
  {
    title: "Live Session",
    category: "audio",
    type: "Recording",
    year: "2024",
    client: "Artist Name",
    role: "Recording, Mix, Video",
    description: "Placeholder — live session recorded and filmed in the studio.",
    images: [],
    media: null
  }
];

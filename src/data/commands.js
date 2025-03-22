export const commands = [
  // Tab Management
  {
    id: "open-tab",
    name: "Open Tab",
    description: "Open a new tab with a specific URL",
    icon: "Tab",
    category: "Tabs",
    hasInput: true,
    action: (url) => console.log("Opening tab:", url),
  },
  {
    id: "close-tab",
    name: "Close Tab",
    description: "Close the current tab",
    icon: "Tab",
    category: "Tabs",
    action: () => console.log("Closing tab"),
  },
  // Add more commands following the same pattern...
  {
    id: "google-search",
    name: "Google Search",
    description: "Search Google for a query",
    icon: "Search",
    category: "Search",
    hasInput: true,
    action: (query) => console.log("Searching Google:", query),
  },
  {
    id: "youtube-search",
    name: "YouTube Search",
    description: "Search YouTube for a video",
    icon: "Youtube",
    category: "Search",
    hasInput: true,
    action: (query) => console.log("Searching YouTube:", query),
  },
  // Add the rest of your commands here...
];

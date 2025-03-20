import React, { useState, useEffect, useRef } from "react";

const defaultCommands = [
  {
    id: "search",
    title: "Search",
    description: "Search for content",
    icon: "🔍",
    action: () => console.log("Search action triggered"),
  },
  {
    id: "settings",
    title: "Settings",
    description: "Open extension settings",
    icon: "⚙️",
    action: () => console.log("Settings action triggered"),
  },
  {
    id: "help",
    title: "Help",
    description: "View help documentation",
    icon: "❓",
    action: () => console.log("Help action triggered"),
  },
  {
    id: "feedback",
    title: "Feedback",
    description: "Send feedback about the extension",
    icon: "💬",
    action: () => console.log("Feedback action triggered"),
  },
];

function CommandPalette({ closeCommandPalette, chrome }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCommands, setFilteredCommands] = useState(defaultCommands);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Filter commands based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCommands(defaultCommands);
      return;
    }

    const filtered = defaultCommands.filter(
      (command) =>
        command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        command.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCommands(filtered);
    setSelectedIndex(0); // Reset selection when search changes
  }, [searchTerm]);

  // Auto focus input when opened
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        if (filteredCommands.length > 0) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case "Escape":
        closeCommandPalette();
        break;
      default:
        break;
    }
  };

  const executeCommand = (command) => {
    command.action();
    closeCommandPalette();
  };

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden flex flex-col">
      <input
        ref={inputRef}
        className="w-full px-4 py-3 text-base border-none border-b border-gray-200 focus:outline-none"
        type="text"
        placeholder="Type a command..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex-1 overflow-y-auto py-2">
        {filteredCommands.length > 0 ? (
          filteredCommands.map((command, index) => (
            <div
              key={command.id}
              className={`px-4 py-3 cursor-pointer flex items-center hover:bg-blue-50 ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
              onClick={() => executeCommand(command)}
            >
              <div className="w-6 h-6 mr-3 flex items-center justify-center text-gray-600">
                {command.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">{command.title}</div>
                <div className="text-xs text-gray-600">
                  {command.description}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-600">No commands found</div>
        )}
      </div>
    </div>
  );
}

export default CommandPalette;

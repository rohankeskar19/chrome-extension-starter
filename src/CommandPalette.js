import React, { useState, useEffect, useRef } from "react";
import SimpleBar from "simplebar-react";
import "./App.css";
import { commands } from "./data/commands";

function CommandPalette({ closeCommandPalette, chrome }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCommands, setFilteredCommands] = useState(commands);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const inputRef = useRef(null);
  const selectedCommandRef = useRef(null);

  // Group commands by category
  const categories = ["All", ...new Set(commands.map((cmd) => cmd.category))];

  // Filter commands based on search term and category
  useEffect(() => {
    let filtered = commands;

    // Filter by category first (if not "All")
    if (selectedCategory !== "All") {
      filtered = filtered.filter((cmd) => cmd.category === selectedCategory);
    }

    // Then filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (command) =>
          command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          command.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          command.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCommands(filtered);
    setSelectedIndex(0); // Reset selection when filters change
  }, [searchTerm, selectedCategory]);

  // Auto focus input when opened
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll selected command into view
  useEffect(() => {
    if (selectedCommandRef.current) {
      selectedCommandRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

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
      case "Tab":
        e.preventDefault();
        const currentIndex = categories.indexOf(selectedCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        setSelectedCategory(categories[nextIndex]);
        break;
      default:
        break;
    }
  };

  const executeCommand = (command) => {
    if (command.hasInput) {
      // If command requires input, update the search term with command prefix
      setSearchTerm(`${command.id} `);
      inputRef.current.focus();
    } else {
      command.action();
      closeCommandPalette();
    }
  };

  return (
    <div className="w-full h-full relative bg-gray-900 rounded-lg overflow-hidden flex flex-col shadow-xl border border-gray-700 pb-[1rem]">
      <div className="relative">
        <input
          ref={inputRef}
          className="w-full px-4 py-4 text-base bg-gray-800 text-gray-100 border-none outline-none"
          type="text"
          placeholder="Type a command..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-4 top-4 bg-gray-800 text-gray-400 p-1 rounded text-sm">
          ESC to close
        </div>
      </div>

      <div className="flex flex-col grow py-2 bg-gray-800 max-h-[90%] pb-[3rem]">
        <SimpleBar className="flex flex-col grow py-2 bg-gray-800 w-full overflow-y-auto">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                ref={index === selectedIndex ? selectedCommandRef : null}
                className={`px-4 py-3 cursor-pointer flex items-start hover:bg-gray-700 transition-colors duration-150 ${
                  index === selectedIndex ? "bg-gray-700" : ""
                }`}
                onClick={() => executeCommand(command)}
              >
                <div className="w-8 h-8 mr-3 flex items-center justify-center text-xl">
                  {command.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1 text-gray-200">
                    {command.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {command.description}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
              <svg
                className="w-12 h-12 mb-3 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p>No commands found</p>
              <p className="text-xs mt-2 text-gray-500">
                Try a different search term
              </p>
            </div>
          )}
        </SimpleBar>
      </div>

      <div className="bg-gray-900 px-4 py-3 border-t border-gray-700 text-xs text-gray-500 flex justify-between absolute bottom-0 left-0 w-full">
        <div>
          <span className="bg-gray-800 text-gray-400 p-1 rounded">↑</span>
          <span className="bg-gray-800 text-gray-400 p-1 rounded ml-1">↓</span>
          <span className="ml-1">to navigate</span>
        </div>
        <div>
          <span className="bg-gray-800 text-gray-400 p-1 rounded">Tab</span>
          <span className="ml-1">to switch category</span>
        </div>
        <div>
          <span className="bg-gray-800 text-gray-400 p-1 rounded">Enter</span>
          <span className="ml-1">to select</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;

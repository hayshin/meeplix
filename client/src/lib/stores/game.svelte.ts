// Main game store file - re-exports from modular structure
export * from "./game/index";

// For backward compatibility, also export the main store instance
export { gameStore as default } from "./game/index";

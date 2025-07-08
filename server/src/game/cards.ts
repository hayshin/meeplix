import { Card } from "$ws/models/card.model";
import * as fs from "fs";
import * as path from "path";

export function loadCardsFromAssets(): Card[] {
  const cardsDir = path.join(process.cwd(), "assets", "cards");

  try {
    if (!fs.existsSync(cardsDir)) {
      console.warn(
        `Cards directory not found: ${cardsDir}. Using fallback cards.`,
      );
      return createFallbackCards();
    }

    const files = fs.readdirSync(cardsDir);

    const jpgFiles = files.filter(
      (file) =>
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg") ||
        file.toLowerCase().endsWith(".png"),
    );

    const cards = jpgFiles.map((filename, index) => {
      const cardName = path.parse(filename).name;
      return {
        id: String(index + 1),
        // name: filename,
        imageUrl: `$assets/cards/${filename}`,
        // description: cardName.replace(/[-_]/g, " "), // Change dashes to whitespaces
      };
    });

    if (cards.length === 0) {
      console.warn(
        "No JPG files found in cards directory. Using fallback cards.",
      );
      return createFallbackCards();
    }

    console.log(`Loaded ${cards.length} cards from assets/cards directory`);
    return cards;
  } catch (error) {
    console.error("Error loading cards from assets:", error);
    return createFallbackCards();
  }
}

function createFallbackCards(): Card[] {
  return Array.from({ length: 30 }, (_, i) => {
    return {
      id: String(i + 1),
      // name: `Card ${i + 1}`,
      imageUrl: `$assets/cards/card${i + 1}.jpg`,
      // description: `Card ${i + 1}`,
    };
  });
}

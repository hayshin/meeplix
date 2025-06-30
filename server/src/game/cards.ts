import { CardEntity } from "$types/card";
import * as fs from "fs";
import * as path from "path";

export function loadCardsFromAssets(): CardEntity[] {
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
      return CardEntity.fromType({
        id: String(index + 1),
        title: filename,
        // imageUrl: `$assets/cards/${filename}`,
        // description: cardName.replace(/[-_]/g, " "), // Change dashes to whitespaces
      });
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

function createFallbackCards(): CardEntity[] {
  return Array.from({ length: 30 }, (_, i) =>
    CardEntity.fromType({
      id: String(i + 1),
      title: `Card ${i + 1}`,
      // imageUrl: `$assets/cards/card${i + 1}.jpg`,
      // description: `Card ${i + 1}`,
    }),
  );
}

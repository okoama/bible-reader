import * as path from "path";
import { fileURLToPath } from "url";
import { parseCatechism } from "./catechism.js";
import { parseSumma } from "./summa.js";
import { parseConfessions } from "./confessions.js";
import { parseImitation } from "./imitation.js";
import { parseDevoutLife } from "./devout-life.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_DIR = path.join(__dirname, "..", "input");
const OUTPUT_DIR = path.join(__dirname, "..", "..", "..", "public", "data");

async function main() {
  console.log("=== Catholic Text Importer ===\n");

  console.log("1. Catechism of the Catholic Church...");
  try {
    parseCatechism(
      path.join(INPUT_DIR, "catechism.json"),
      path.join(OUTPUT_DIR, "catechism.json")
    );
  } catch (e: any) {
    console.error("  FAILED:", e.message);
  }

  console.log("\n2. Summa Theologiae...");
  try {
    parseSumma(
      path.join(INPUT_DIR, "summa-all.json"),
      path.join(OUTPUT_DIR, "summa")
    );
  } catch (e: any) {
    console.error("  FAILED:", e.message);
  }

  console.log("\n3. Confessions of St. Augustine...");
  try {
    parseConfessions(
      path.join(INPUT_DIR, "confessions.txt"),
      path.join(OUTPUT_DIR, "confessions.json")
    );
  } catch (e: any) {
    console.error("  FAILED:", e.message);
  }

  console.log("\n4. The Imitation of Christ...");
  try {
    parseImitation(
      path.join(INPUT_DIR, "imitation.txt"),
      path.join(OUTPUT_DIR, "imitation")
    );
  } catch (e: any) {
    console.error("  FAILED:", e.message);
  }

  console.log("\n5. Introduction to the Devout Life...");
  try {
    parseDevoutLife(
      path.join(INPUT_DIR, "devout-life.txt"),
      path.join(OUTPUT_DIR, "devout-life")
    );
  } catch (e: any) {
    console.error("  FAILED:", e.message);
  }

  console.log("\n=== Done ===");
}

main();

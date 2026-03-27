/**
 * Seed script — inserts the canonical category taxonomy.
 * Run once against a fresh MongoDB Atlas cluster:
 *   npx tsx src/lib/seed.ts
 */
import { connectDB } from "./db";
import { Category } from "@/models/Category";

const CATEGORIES = [
  { slug: "news",     name: "News",        description: "Breaking crypto and blockchain news" },
  { slug: "markets",  name: "Markets",     description: "Price analysis, market trends, and trading insights" },
  { slug: "web3-defi",name: "Web3 & DeFi", description: "Decentralized finance, NFTs, and Web3 ecosystem" },
  { slug: "tutorials",name: "Tutorials",   description: "Step-by-step guides for crypto beginners and advanced users" },
  { slug: "reviews",  name: "Reviews",     description: "Exchange reviews, wallet reviews, and project deep dives" },
];

async function seed() {
  await connectDB();

  for (const cat of CATEGORIES) {
    await Category.updateOne(
      { slug: cat.slug },
      { $setOnInsert: cat },
      { upsert: true }
    );
    console.log(`✓ Category upserted: ${cat.slug}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

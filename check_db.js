const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const articles = await db.collection('articles').find({}).toArray();
  console.log("Articles:", JSON.stringify(articles, null, 2));
  process.exit(0);
}
check().catch(console.error);

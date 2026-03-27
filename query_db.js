const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const articles = await db.collection('articles').find({}).toArray();
  console.log("Articles count:", articles.length);
  if(articles.length > 0) {
     console.log(articles.map(a => ({slug: a.slug, categorySlug: a.categorySlug, status: a.status})));
  }
  process.exit(0);
}
run();

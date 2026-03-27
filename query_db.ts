import mongoose from 'mongoose';
import { Article } from './src/models/Article';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blockhay");
  const articles = await Article.find({}).lean();
  console.log(JSON.stringify(articles, null, 2));
  process.exit(0);
}
run();

import mongoose from 'mongoose';
import 'dotenv/config';
import { Article } from './src/models/Article';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const articles = await Article.find().lean();
  console.log(articles);
  process.exit(0);
}
main();

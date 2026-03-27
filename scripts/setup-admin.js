const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Next.js uses .env.local primarily, but load .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ Thiếu biến môi trường MONGODB_URI (Đã kiểm tra .env và .env.local)");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Kết nối MongoDB thành công!");

  // Tạo collection users thủ công không cần load Next.js
  const userSchema = new mongoose.Schema({
    email: String,
    passwordHash: String,
    name: String,
    role: String,
    isActive: Boolean
  });
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const email = "admin@blockhay.com";
  const password = "password123";
  
  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    console.log("⚠️ Tài khoản admin đã tồn tại. Dùng email:", email);
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await User.create({
      email,
      passwordHash,
      name: "Super Admin",
      role: "admin",
      isActive: true
    });
    console.log("🎉 Tạo tài khoản Admin thành công!");
    console.log("👉 Email:", email);
    console.log("👉 Password:", password);
  }

  // Khởi tạo các Category mặc định luôn
  const categorySchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true }
  });
  const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
  
  const defaultCats = [
    { name: "News", slug: "news" },
    { name: "Markets", slug: "markets" },
    { name: "Web3 & DeFi", slug: "web3-defi" },
    { name: "Tutorials", slug: "tutorials" },
    { name: "Reviews", slug: "reviews" }
  ];
  
  for (const cat of defaultCats) {
    await Category.updateOne({ slug: cat.slug }, { $set: cat }, { upsert: true });
  }
  console.log("✅ Khởi tạo danh mục thành công!");

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch(console.error);

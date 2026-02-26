import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import { categories, products, users } from "../data/seedData.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      Order.deleteMany(),
      Product.deleteMany(),
      Category.deleteMany(),
      User.deleteMany(),
    ]);

    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    await User.insertMany(hashedUsers);
    const createdCategories = await Category.insertMany(categories);

    const categoryMap = createdCategories.reduce((acc, category) => {
      acc[category.slug] = category._id;
      return acc;
    }, {});

    const productPayload = products.map((product) => ({
      ...product,
      category: categoryMap[product.categorySlug],
    }));

    await Product.insertMany(productPayload);

    console.log("Seed complete: users, categories, products inserted");
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();

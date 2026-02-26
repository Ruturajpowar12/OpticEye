import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const makeSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 });
  res.json(categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, image, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const slug = makeSlug(name);

  const exists = await Category.findOne({ slug });
  if (exists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    name,
    slug,
    image: image || "",
    description: description || "",
  });

  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (req.body.name) {
    const nextSlug = makeSlug(req.body.name);
    const existing = await Category.findOne({
      slug: nextSlug,
      _id: { $ne: category._id },
    });

    if (existing) {
      res.status(400);
      throw new Error("Category name already in use");
    }

    category.name = req.body.name;
    category.slug = nextSlug;
  }

  category.image = req.body.image ?? category.image;
  category.description = req.body.description ?? category.description;

  const updated = await category.save();
  res.json(updated);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const linkedProducts = await Product.countDocuments({ category: category._id });
  if (linkedProducts > 0) {
    res.status(400);
    throw new Error("Cannot delete category with linked products");
  }

  await category.deleteOne();
  res.json({ message: "Category removed" });
});
